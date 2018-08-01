import * as React from 'react'
import { BrowserRouter, Switch, Route, NavLink as Link } from 'react-router-dom'
import {
  Collapse,
  NavbarToggler,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
  Button,
  Form,
} from 'reactstrap'
import styled from 'react-emotion'
import loadable from 'loadable-components'
import { BooleanValue } from 'react-values'
import Dash from '../pages/dash'
import { AuthProvider, AuthConsumer as Auth } from './Auth'
import { ZenProvider, ZenConsumer } from './Zen'

// const AuthProvider: any = loadable(async () => {
//   const [{ app }, { AuthProvider }] = await Promise.all([
//     import('../lib/firebase'),
//     import('./Auth'),
//   ])
//   const AP: any = (props: any) => <AuthProvider firebase={app} {...props} />
//   return AP
// })
// const Auth = loadable(async () => {
//   const { AuthConsumer } = await import('./Auth')
//   return AuthConsumer
// })

// const Dash = loadable(() => import('../pages/dash'))
const Lease = loadable(() => import('../pages/lease'))
const Login = loadable(() => import('../pages/login'))

class Header extends React.Component<{}, { isOpen: boolean }> {
  state = {
    isOpen: false,
  }
  toggle = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    return (
      <Navbar color="dark" dark expand="md" fixed="top">
        <NavbarToggler className="ml-auto" onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <NavbarBrand to="/" tag={Link}>
            WPM
          </NavbarBrand>
          <Nav className="ml-auto" navbar>
            <Form inline>
              <ZenConsumer>
                {({ value, toggle }) => (
                  <Button outline onClick={toggle}>
                    Zen is {value ? 'on' : 'off'}
                  </Button>
                )}
              </ZenConsumer>
            </Form>
            <NavItem>
              <Auth>
                {auth =>
                  auth.user ? (
                    <NavLink
                      href="#"
                      onClick={(e: any) => {
                        e.preventDefault()
                        auth.signOut()
                      }}>
                      Sign Out
                    </NavLink>
                  ) : null
                }
              </Auth>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <AuthProvider claims={['activeCompany']}>
        <BrowserRouter>
          <ZenProvider>
            <AppContainer>
              <Login />
              <Header />
              <Main>
                <Switch>
                  <Route path="/" exact component={Dash} />
                  <Route path="/lease" component={Lease} />
                </Switch>
              </Main>
            </AppContainer>
          </ZenProvider>
        </BrowserRouter>
      </AuthProvider>
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
