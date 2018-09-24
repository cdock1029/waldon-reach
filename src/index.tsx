import React from 'react'
import { render } from 'react-dom'
import loadable from 'loadable-components'
import { init, observeUser } from './shared/firebase'
import * as serviceWorker from './registerServiceWorker'
import './shared/observableConfig'

const App = loadable(() => import('./screens/App'))
const Login = loadable(() => import('./screens/Login'))
const root = document.getElementById('root')

async function main() {
  await init()
  observeUser(
    user => {
      render(user ? <App /> : <Login />, root)
    },
    ['activeCompany', 'algoliaSecuredApiKey'],
  )
}
main()
serviceWorker.register()
