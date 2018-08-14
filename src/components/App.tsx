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
import { app } from '../lib/firebase'

const ZenProvider = loadable(() => import('./Zen').then(mod => mod.ZenProvider))
const ZenConsumer = loadable(() => import('./Zen').then(mod => mod.ZenConsumer))
const Dash = loadable(() => import('../pages/dash'))
const Lease = loadable(() => import('../pages/lease'))
const Qbo = loadable(() => import('../pages/qbo').then(mod => mod.Qbo))

class Header extends React.Component<{}, { isOpen: boolean }> {
  state = {
    isOpen: false,
  }
  toggle = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  signOut = (e: any) => {
    e.preventDefault()
    app()
      .auth()
      .signOut()
  }
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
            <React.Fragment>
              <NavItem>
                <NavLink tag={Link} to="/qbo">
                  QBO
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" onClick={this.signOut}>
                  Sign Out
                </NavLink>
              </NavItem>
            </React.Fragment>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      // <AuthProvider claims={['activeCompany']}>
      //   <AuthConsumer>
      //     {({ user }) =>
      //       user ? (
      <BrowserRouter>
        <ZenProvider>
          <AppContainer>
            <Header />
            <Main>
              <Switch>
                <Route path="/" exact component={Dash} />
                <Route path="/lease" component={Lease} />
                <Route path="/qbo" component={Qbo} />
              </Switch>
            </Main>
          </AppContainer>
        </ZenProvider>
      </BrowserRouter>
      //       ) : (
      //         <Login />
      //       )
      //     }
      //   </AuthConsumer>
      // </AuthProvider>
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
