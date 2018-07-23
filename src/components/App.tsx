import * as React from 'react'
import { Router, Link } from '@reach/router'
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

import Dashboard from '../pagesClient/Dashboard'
import Properties from '../pagesClient/Properties'
import Tenants from '../pagesClient/Tenants'
import Lease from '../pagesClient/Lease'
import Notes from '../pagesClient/NOTES.mdx'

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
  render() {
    console.log('render App')
    return (
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

export default App
