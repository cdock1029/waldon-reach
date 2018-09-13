import React from 'react'
import { render } from 'react-dom'
import loadable from 'loadable-components'
import { onAuthStateChangedWithClaims, init } from './shared/firebase'
import * as serviceWorker from './registerServiceWorker'

const App = loadable(() => import('./screens/App'))
const Login = loadable(() => import('./screens/Login'))
const root = document.getElementById('root')

async function main() {
  await init()
  onAuthStateChangedWithClaims(
    ['activeCompany', 'algoliaSecuredApiKey'],
    (user, claims) => {
      // todo: check claims and show company setup screens if not present
      render(user ? <App /> : <Login />, root)
    },
  )
}
main()
serviceWorker.register()
