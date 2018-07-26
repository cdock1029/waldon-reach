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
import styled, { css } from 'react-emotion'
import Loadable from 'react-loadable'
import Login from '../pages/login'

const Loading = ({ pastDelay }: any) => (pastDelay ? <h1>Loading..</h1> : null)
const loadDefaults = {
  loading: Loading,
  delay: 400,
}
const Properties = Loadable({
  loader: () => import('../pages/properties'),
  ...loadDefaults,
})
const Tenants = Loadable({
  loader: () => import('../pages/tenants'),
  ...loadDefaults,
})
const Lease = Loadable({
  loader: () => import('../pages/lease'),
  ...loadDefaults,
})
/* const Login = Loadable({
  loader: () => import('../pages/login'),
  ...loadDefaults,
})*/
const Home = Loadable({
  loader: () => import('../pages'),
  ...loadDefaults,
})

class Header extends React.Component<{}, { isOpen: boolean }> {
  state = {
    isOpen: false,
  }
  toggle = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    return (
      <Navbar className={headerStyle} color="dark" dark expand="md" fixed="top">
        <NavbarBrand to="/" tag={Link}>
          WPM
        </NavbarBrand>
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
          </Nav>
          <Nav className="ml-auto" navbar>
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
      <AuthProvider claims={['activeCompany']}>
        <BrowserRouter>
          <AppContainer>
            <Login />
            <Header />
            <Main>
              <Switch>
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
