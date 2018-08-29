import * as React from 'react'
import { Router } from '@reach/router'
import styled from 'react-emotion'
import loadable from 'loadable-components'
import { Header } from './components/Header'

const ZenProvider = loadable(() =>
  import('./shared/components/Zen').then(mod => mod.ZenProvider),
)

const Index = loadable(() => import('./screens/Index'))
const Lease = loadable(() => import('./screens/Lease'))
const Qbo = loadable(() => import('./screens/Qbo'))
const Search = loadable(() => import('./screens/Search'))
const Todos = loadable(() => import('./screens/Todos'))

class App extends React.Component {
  render() {
    return (
      <ZenProvider>
        <AppContainer>
          <Header />
          <Main>
            <Router>
              <Index path="/" />
              <Lease path="lease" />
              <Search path="search" />
              <Qbo path="qbo" />
              <Todos path="todos" />
            </Router>
          </Main>
        </AppContainer>
      </ZenProvider>
    )
  }
}
const AppContainer = styled.div`
  height: 100vh;
`
const Main = styled.main`
  padding-top: 56px;
  height: 100%;
`

export default App
