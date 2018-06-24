import * as React from 'react'
import * as ReactDOM from 'react-dom'
import firebase, { auth } from '@lib/firebase'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
// import registerServiceWorker from './registerServiceWorker'
const root = document.getElementById('root') as HTMLElement

const renderApp = () => {
  const App = require('@comp/App').default
  ReactDOM.render(<App />, root)
}
const renderLogin = () => {
  const Login = require('@page/Login').default
  ReactDOM.render(<Login />, root)
}

// TODO handle multiple tabs error..
firebase
  .firestore()
  .enablePersistence()
  .then(() => {
    console.log('persistence enabled..')
    auth.onAuthStateChanged(user => {
      if (user) {
        renderApp()
      } else {
        renderLogin()
      }
    })
  })

if (module.hot) {
  module.hot.accept(['@comp/App', '@page/Login'], () => {
    if (auth.currentUser) {
      console.log('hmr App')
      setTimeout(renderApp)
    } else {
      console.log('hmr Login')
      setTimeout(renderLogin)
    }
  })
}

// registerServiceWorker()
