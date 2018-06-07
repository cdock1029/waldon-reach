import * as React from 'react'
import * as ReactDOM from 'react-dom'
import firebase from '@lib/firebase'
import { FirebaseAuthProvider } from '@comp/FirebaseAuth'
import App from '@comp/App'
import './index.css'
// import registerServiceWorker from './registerServiceWorker'

const renderApp = () => {
  ReactDOM.render(
    <FirebaseAuthProvider firebase={firebase}>
      <App />
    </FirebaseAuthProvider>,
    document.getElementById('root') as HTMLElement,
  )
}

renderApp()

if (module.hot) {
  module.hot.accept('@comp/App', () => {
    renderApp()
  })
}

// registerServiceWorker()
