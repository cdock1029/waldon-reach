import * as React from 'react'
import { Router, Link } from '@reach/router'
import { Router as StaticRouter, Switch, Route } from 'react-static'
// import Routes from 'react-static-routes'
import universal from 'react-universal-component'
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
import { auth } from '../lib/firebase'
import { css } from 'react-emotion'
import Login from '../pages/index'

const Dashboard: any = universal(import('../pagesClient/Dashboard'))
const Properties: any = universal(import('../pagesClient/Properties'))
const Tenants: any = universal(import('../pagesClient/Tenants'))
const Lease: any = universal(import('../pagesClient/Lease'))
// import Notes from '../pagesClient/NOTES.mdx'

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
              <NavLink
                href="#"
                onClick={(e: any) => {
                  e.preventDefault()
                  auth.signOut()
                }}>
                Sign Out
              </NavLink>
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

const Home: React.SFC<any> = () => (
  <div className={homeStyle}>
    <h4>Home page</h4>
    <br />
    <Link to="dashboard">Dashboard</Link>
  </div>
)
const homeStyle = css`
  padding: 1em;
  label: Home;
`

class App extends React.Component {
  state = {
    user: null,
    hasLoaded: false,
  }
  componentDidMount() {
    auth.onAuthStateChanged(async user => {
      await auth.updateCompany()
      this.setState(() => ({
        user,
        hasLoaded: true,
      }))
    })
  }
  render() {
    const { hasLoaded, user } = this.state
    console.log('render App')
    if (!hasLoaded) {
      return null
    }
    return user !== null ? (
      <div className={appStyle}>
        <Header />
        <Router className="router">
          <Home path="/" />
          <Dashboard path="dashboard/*" />
          <Properties path="properties/*" />
          <Tenants path="tenants/*" />
          <Lease path="lease/*" />
          <NotFound default />
        </Router>
      </div>
    ) : (
      <StaticRouter>
        <div>
          <Route path="/" component={Login} />
        </div>
      </StaticRouter>
    )
  }
}
const appStyle = css`
  label: App;
  height: 100vh;
  .router {
    padding-top: 56px;
    height: 100%;
  }
`

export default hot(module)(App)
