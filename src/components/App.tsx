import * as React from 'react'
import { BrowserRouter, Switch, Route, NavLink as Link } from 'react-router-dom'
import { AuthProvider, AuthConsumer as Auth } from './Auth'
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
import { app as firebase } from '../lib/firebase'
import styled, { css } from 'react-emotion'
import Properties from '../pages/properties'
import Tenants from '../pages/tenants'
import Lease from '../pages/lease'
import Login from '../pages/login'
import Dashboard from '../components/dashboard'
import Home from '../pages'

class Header extends React.Component<{}, { isOpen: boolean }> {
  state = {
    isOpen: false,
  }
  toggle = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    return (
      <Navbar className={headerStyle} color="dark" dark expand="md" fixed="top">
        <NavbarBrand to="/" tag={Link} />
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
              <NavLink tag={Link} to="/tenants">
                Tenants
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/properties">
                Properties
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="/dash">
                Dashboard
              </NavLink>
            </NavItem>
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
      <AuthProvider firebase={firebase} claims={['activeCompany']}>
        <BrowserRouter>
          <AppContainer>
            <Login />
            <Header />
            <Main>
              <Switch>
                <Route path="/dash" component={Dashboard} />
                <Route path="/" exact component={Home} />
                <Route path="/properties" component={Properties} />
                <Route path="/tenants" component={Tenants} />
                <Route path="/lease" component={Lease} />
              </Switch>
            </Main>
          </AppContainer>
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

// export default hot(module)(App)
export default App
