import * as React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import styled from 'react-emotion'
import loadable from 'loadable-components'
import { Header } from './components/Header'

const ZenProvider = loadable(() =>
  import('./shared/components/Zen').then(mod => mod.ZenProvider),
)

const Dash = loadable(() => import('./screens/Index'))
const Lease = loadable(() => import('./screens/Lease'))
const Qbo = loadable(() => import('./screens/Qbo'))
const Search = loadable(() => import('./screens/Search'))
const Todos = loadable(() => import('./screens/Todos'))

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <ZenProvider>
          <AppContainer>
            <Header />
            <Main>
              <Switch>
                <Route path="/" exact component={Dash} />
                <Route path="/lease" component={Lease} />
                <Route path="/search" component={Search} />
                <Route path="/qbo" component={Qbo} />
                <Route path="/todos" component={Todos} />
              </Switch>
            </Main>
          </AppContainer>
        </ZenProvider>
      </BrowserRouter>
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
