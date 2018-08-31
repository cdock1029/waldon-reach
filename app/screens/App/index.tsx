import * as React from 'react'
import { Router } from '@reach/router'
import styled from 'react-emotion'
import loadable from 'loadable-components'
import { ThemeProvider } from 'emotion-theming'
import system from 'system-components/emotion'
import { Header } from './components/Header'

const ZenProvider = loadable(() =>
  import('./shared/components/Zen').then(mod => mod.ZenProvider),
)

const Index = loadable(() => import('./screens/Index'))
const Lease = loadable(() => import('./screens/Lease'))
const Qbo = loadable(() => import('./screens/Qbo'))
const Search = loadable(() => import('./screens/Search'))
const Todos = loadable(() => import('./screens/Todos'))

const theme = {
  fontSizes: [12, 14, 16, 18, 24, 32, 48, 64],
  space: [
    // padding and margin
    0,
    4,
    8,
    16,
    24,
    32,
    64,
    128,
  ],
  colors: {
    green: '#ddffdd',
    red: '#ffeeee',
  },
}

class App extends React.Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    )
  }
}
const AppContainer = styled.div`
  height: 100vh;
`
/*const Main = styled.main`
  padding-top: 49px;
  height: 100%;
`*/
const Main = system({
  pt: '49px',
  height: '100%',
  fontSize: [0, 1, 1, 2],
})

export default App
