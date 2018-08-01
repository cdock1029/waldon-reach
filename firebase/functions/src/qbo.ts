import * as functions from 'firebase-functions'
import express, { Request, Response } from 'express'
import axios from 'axios'
import path from 'path'
import cookieSession from 'cookie-session'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import qs from 'query-string'
import Tokens from 'csrf'
import doAsync from 'doasync'
import QuickBooks from 'node-quickbooks'

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

export const app = express()

app.set('trust proxy', 1)
app.set('views', path.join(__dirname, '../src/views'))
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser('cdock'))
app.use(
  cookieSession({
    name: 'session',
    keys: ['asdfaopawieoioe', 'qpowehophs', 'qphodoiseh'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }),
)

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
