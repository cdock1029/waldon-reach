import React from 'react'
import { render } from 'react-dom'
import { firestore } from './lib/firebase'
import App from './components/App'
import registerServiceWorker from './register-service-worker'

async function main() {
  const root = document.getElementById('root')
  try {
    await firestore.enablePersistence()
  } catch (e) {
    if (
      !e.message.includes('Firestore has already been started and persistence')
    ) {
      console.log({ e1: e })
    }
  } finally {
    render(<App />, root)
  }
}
main()
registerServiceWorker()
