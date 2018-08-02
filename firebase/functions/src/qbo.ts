import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import express, { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import path from 'path'
import cookieSession from 'cookie-session'
import bodyParser from 'body-parser'
import qs from 'query-string'
import Tokens from 'csrf'
import doAsync from 'doasync'
import QuickBooks from 'node-quickbooks'
const cookieParser = require('cookie-parser')() // <-- why?
const cors = require('cors')({ origin: true })

const { qbo } = functions.config()
// QuickBooks.setOauthVersion('2.0')
const AUTHORIZATION_URL =
  qbo.authorization_url || 'https://appcenter.intuit.com/connect/oauth2'
// const TOKEN_URL = qbo.token_url || 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'

const csrf = new Tokens()
const consumerKey = qbo.consumer_key
const consumerSecret = qbo.consumer_secret
const appRoot = qbo.app_root || 'qbo'
const ejs = require('ejs')

if (typeof ejs !== 'undefined') {
  console.log('')
}

async function generateAntiForgery(session: any, csrfModule: any) {
  const secret = await csrfModule.secret()
  const token = csrfModule.create(secret)
  session.secret = secret
  return token
}

type AuthRequest = Request & { user?: admin.auth.DecodedIdToken }

const validateFirebaseIdToken: (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => any = (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token')

  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.',
    )
    res.status(403).send('Unauthorized')
    return
  }

  let idToken
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    console.log('Found "Authorization" header')
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1]
  } else if (req.cookies) {
    console.log('Found "__session" cookie')
    // Read the ID Token from cookie.
    idToken = req.cookies.__session
  } else {
    // No cookie
    res.status(403).send('Unauthorized')
    return
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      console.log('ID Token correctly decoded', decodedIdToken)
      req.user = decodedIdToken
      next()
    })
    .catch(error => {
      console.error('Error while verifying Firebase ID token:', error)
      res.status(403).send('Unauthorized')
    })
}

export const app = express()
const authRoutes = express.Router()
authRoutes.use(validateFirebaseIdToken)

app.set('trust proxy', 1)
app.set('views', path.join(__dirname, '../src/views'))
app.set('view engine', 'ejs')
// todo: look at this
app.use(cors)
app.use(cookieParser)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cookieSession({
    name: 'session',
    keys: ['asdfaopawieoioe', 'qpowehophs', 'qphodoiseh'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }),
)

app.use('/auth', authRoutes)

app.get('/start', function(req: Request, res: Response) {
  res.render('intuit', {
    protocol: req.protocol,
    host: req.header('host'),
    appRoot: appRoot,
    appCenter: QuickBooks.APP_CENTER_BASE,
  })
})

app.get(
  '/requestToken',
  async (req: Request & { session: any }, res: Response) => {
    let redirectUri = `${AUTHORIZATION_URL}?client_id=${consumerKey}&redirect_uri=${encodeURIComponent(
      `${req.protocol}://${req.header('host')}/${appRoot}/callback/`,
    )}&scope=com.intuit.quickbooks.accounting&response_type=code`

    const state = await generateAntiForgery(req.session, csrf)
    redirectUri += `&state=${state}`

    console.log('redirectUri in /requestToken:', redirectUri)

    res.redirect(redirectUri)
  },
)

app.get('/callback', async (req: Request, res: Response) => {
  const auth = new Buffer(`${consumerKey}:${consumerSecret}`).toString('base64')

  let data
  const redirectUri = `${req.protocol}://${req.header(
    'host',
  )}/${appRoot}/callback/`
  console.log('redirectUri in /callback:', redirectUri)
  try {
    const result = await axios({
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: redirectUri,
      }),
    })
    data = result.data
  } catch (e) {
    console.log(e)
    return res.send(`Error 1: ${e.message}`)
  }

  const Qbo = doAsync(
    new QuickBooks(
      consumerKey,
      consumerSecret,
      data.access_token,
      false, // tokenSecret
      req.query.realmId, // realmId
      true, // sandbox
      false, // debugging
      4, // minorVersion
      '2.0', // oauth version
      data.refresh_token, // refresh token
    ),
  )

  try {
    const accounts = await Qbo.findAccounts()
    return res.send(accounts)
  } catch (e) {
    console.log({ e })
    return res.send(`Error 2: ${e.message}`)
  }
})

authRoutes.get('/hello', (req: AuthRequest, res) => {
  console.log({ user: req.user })
  res.send(`Hello ${req.user!.uid}`)
})
