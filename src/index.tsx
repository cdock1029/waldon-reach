import React from 'react'
import ReactDOM from 'react-dom'
import { firestore } from './lib/firebase'

import App from './components/App'
import Login from './pages/login'
import './app.scss'

const renderApp = () => {
  ReactDOM.render(<App />, document.getElementById('root'))
}

export default Login

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
    renderApp()
  }
}

if (typeof document !== 'undefined') {
  main()
}
