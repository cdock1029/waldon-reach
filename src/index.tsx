import React from 'react'
import ReactDOM from 'react-dom'
import { auth, firestore } from './lib/firebase'
import { injectGlobal } from 'react-emotion'
// import registerServiceWorker from './registerServiceWorker'
const root = document.getElementById('root')

const renderApp = () => {
  const App = require('./components/App').default
  ReactDOM.render(<App />, root)
}
const renderLogin = () => {
  const Login = require('./pages/Login').default
  ReactDOM.render(<Login />, root)
}

// TODO handle multiple tabs error..
async function main() {
  try {
    await firestore.enablePersistence()
    console.log('persistence enabled..')
  } catch (e) {
    if (
      !e.message.includes('Firestore has already been started and persistence')
    ) {
      console.log({ e1: e })
    }
  } finally {
    auth.onAuthStateChanged(async user => {
      if (user) {
        await auth
          .updateCompany()
          .then(() => renderApp())
          .catch(e => console.log({ e2: `${e} todo: register company` }))
      } else {
        renderLogin()
      }
    })
  }
}

/* tslint:disable-next-line:no-unused-expression */
injectGlobal`
  :root {
    --header-height: 56px;
  }
  html {
    box-sizing: border-box;
  }

  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }
  html, body, #root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  div,
  span {
    position: relative;
  }
`

main()

// registerServiceWorker()
