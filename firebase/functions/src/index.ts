import * as functions from 'firebase-functions'
import QuickBooks from 'node-quickbooks'
import doAsync from 'doasync'
import express from 'express'
import cookieSession from 'cookie-session'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import path from 'path'
import axios from 'axios'
import * as qs from 'query-string'
import Tokens from 'csrf'
import ejs from 'ejs'

if (typeof ejs !== 'undefined') {
  console.log('ejs here i guess..')
}
const csrf = new Tokens()

const consumerKey = functions.config().qbo.consumer_key
const consumerSecret = functions.config().qbo.consumer_secret

const appRoot = functions.config().qbo.appRoot || 'app'

QuickBooks.setOauthVersion('2.0')
const app = express()
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

async function generateAntiForgery(session) {
  const secret = await csrf.secret()
  const token = csrf.create(secret)
  // console.log('secret/token:', secret, token)
  session.secret = secret
  return token
}

app.get('/start', function(req, res) {
  // const { connection, socket, headers } = req
  // console.log(JSON.stringify(headers, null, 2))
  /*console.log({
    remoteAddress: connection.remoteAddress,
    remotePort: connection.remotePort,
    localAddress: connection.localAddress,
    localPort: connection.localPort,
    socketLocalPort: socket.localPort,
    socketRemotePort: socket.remotePort,
  })*/
  res.render('intuit', {
    protocol: req.protocol,
    host: req.header('host'),
    appRoot: appRoot,
    appCenter: QuickBooks.APP_CENTER_BASE,
  })
})

app.get(
  '/requestToken',
  async (req: express.Request & { session: any }, res) => {
    let redirectUrl = `${
      QuickBooks.AUTHORIZATION_URL
    }?client_id=${consumerKey}&redirect_uri=${encodeURIComponent(
      `${req.protocol}://${req.header('host')}/${appRoot}/callback/`,
    )}&scope=com.intuit.quickbooks.accounting&response_type=code`

    const state = await generateAntiForgery(req.session)
    redirectUrl += `&state=${state}`

    console.log('redirectUrl:', redirectUrl)

    res.redirect(redirectUrl)
  },
)

app.get('/callback', async (req, res) => {
  const auth = new Buffer(`${consumerKey}:${consumerSecret}`).toString('base64')

  let data
  try {
    const response = await axios({
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
        redirect_uri: `${req.protocol}://${req.header(
          'host',
        )}/${appRoot}/callback/`,
      }),
    })
    data = response.data
  } catch (e) {
    console.log(e)
    return res.send(`Error 1: ${e.message}`)
  }

  console.log({ data })
  //res.send(data)
  const stuff = {
    consumerKey,
    consumerSecret,
    accessToken: data.access_token,
    tokenSecret: false,
    realmId: req.query.realmId,
    sandbox: true,
    debugging: true,
    mindorVersion: 4,
    oauthVersion: '2.0',
    refreshToken: data.refresh_token,
  }
  console.log({ stuff })
  const qbo = new QuickBooks(
    consumerKey,
    consumerSecret,
    data.access_token,
    false,
    req.query.realmId,
    true,
    true,
    4,
    '2.0',
    data.refresh_token,
  )
  const asyncQbo = doAsync(qbo)

  try {
    const accounts = await asyncQbo.findAccounts()
    return res.send(accounts)
  } catch (e) {
    console.log({ e })
    return res.send(`Error 2: ${e.message}`)
  }
})

exports.app = functions.https.onRequest(app)

// exports.app = functions.https.onCall((data, context) => {
//   const raw = context.rawRequest
//   return app(raw, raw.res)
// })
