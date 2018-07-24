import * as React from 'react'
import { Router, Link } from '@reach/router'
import { Router as StaticRouter, Switch, Route } from 'react-static'
import { AuthProvider, AuthConsumer as Auth } from './Auth'
import { hot } from 'react-hot-loader'
import {
  Collapse,
  NavbarToggler,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
  Form,
  FormGroup,
  Input,
} from 'reactstrap'
import { isPartiallyActive } from '../lib/index'
import { app as firebase } from '../lib/firebase'
import styled, { css } from 'react-emotion'
import Dashboard from '../pages/dashboard'
import Properties from '../pages/properties'
import Tenants from '../pages/tenants'
import Lease from '../pages/lease'
import Login from '../pages/login'

const NotFound: React.SFC<{ default?: boolean }> = () => <h1>Not found</h1>
class Header extends React.Component<{}, { isOpen: boolean }> {
  state = {
    isOpen: false,
  }
  toggle = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    console.log('render Header')
    return (
      <Navbar className={headerStyle} color="dark" dark expand="md" fixed="top">
        <NavbarBrand to="/" tag={props => <Link {...props}>Home</Link>} />
        <Nav className="mr-auto" navbar>
          <Form inline>
            <FormGroup className="mx-sm-2 mb-0">
              <Input
                className="mr-sm-3"
                bsSize="sm"
                type="search"
                id="search"
                name="search"
                placeholder="Search"
              />
            </FormGroup>
          </Form>
        </Nav>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav navbar>
            <NavItem>
              <NavLink
                tag={props => (
                  <Link
                    getProps={isPartiallyActive(props.className)}
                    {...props}
                  />
                )}
                to="tenants">
                Tenants
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                tag={props => (
                  <Link
                    getProps={isPartiallyActive(props.className)}
                    {...props}
                  />
                )}
                to="properties">
                Properties
              </NavLink>
            </NavItem>
            {/* <NavItem>
              <NavLink
                tag={props => (
                  <Link
                    getProps={isPartiallyActive(props.className)}
                    {...props}
                  />
                )}
                to="notes">
                Notes
              </NavLink>
            </NavItem> */}
          </Nav>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <Auth>
                {auth => (
                  <NavLink
                    href="#"
                    onClick={(e: any) => {
                      e.preventDefault()
                      auth.signOut()
                    }}>
                    Sign Out
                  </NavLink>
                )}
              </Auth>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

const headerStyle = css`
  /* height: var(--header-height); */
  label: Header;
`

// const Home: React.SFC<any> = () => (
//   <div className={homeStyle}>
//     <h4>Home page</h4>
//     <br />
//     <Link to="dashboard">Dashboard</Link>
//   </div>
// )
// const homeStyle = css`
//   padding: 1em;
//   label: Home;
// `

class App extends React.Component {
  render() {
    return (
      <AuthProvider firebase={firebase}>
        <StaticRouter>
          <AppContainer>
            <Login />
            <Header />
            <Main>
              <Switch>
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/properties" component={Properties} />
                <Route path="/tenants" component={Tenants} />
                <Route path="/lease" component={Lease} />
              </Switch>
            </Main>
          </AppContainer>
        </StaticRouter>
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

export default hot(module)(App)
