import React from 'react'
import { render } from 'react-dom'
import { init, onAuthStateChangedWithClaims } from './shared/firebase'
import registerServiceWorker from './register-service-worker'
import loadable from 'loadable-components'

const App = loadable(() => import('./screens/App'))
const Login = loadable(() => import('./screens/Login'))
const root = document.getElementById('root')

async function main() {
  await init()
  onAuthStateChangedWithClaims(
    ['activeCompany', 'algoliaSecuredApiKey'],
    (user, claims) => {
      // todo: render something else if no claims present
      render(user ? <App /> : <Login />, root)
    },
  )
}
main()
registerServiceWorker()
