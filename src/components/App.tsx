import * as React from 'react'
import { Router, Link } from '@reach/router'
import { auth } from '@lib/firebase'
import {
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
  Form,
  FormGroup,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'
import Component from '@reactions/component'
import { isPartiallyActive } from '@lib/index'
import { css } from 'react-emotion'

import Dashboard from '@page/Dashboard'
import Properties from '@page/Properties'
import Tenants from '@page/Tenants'
import Lease from '@page/Lease'

const NotFound: React.SFC<{ default?: boolean }> = () => <h1>Not found</h1>
const Header: React.SFC = () => (
  <Navbar className={headerStyle} color="dark" dark expand="md">
    <NavbarBrand to="/" tag={props => <Link {...props}>Home</Link>} />
    <Nav navbar>
      {/* <NavItem>
        <NavLink
          tag={props => (
            <Link getProps={isPartiallyActive(props.className)} {...props} />
          )}
          to="dashboard">
          Dashboard
        </NavLink>
      </NavItem> */}
      <NavItem>
        <NavLink
          tag={props => (
            <Link getProps={isPartiallyActive(props.className)} {...props} />
          )}
          to="properties">
          Properties
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink
          tag={props => (
            <Link getProps={isPartiallyActive(props.className)} {...props} />
          )}
          to="tenants">
          Tenants
        </NavLink>
      </NavItem>
    </Nav>
    <Nav className="ml-auto" navbar>
      <Form inline>
        <FormGroup className="mr-sm-2">
          <Input
            className="mr-sm-3"
            bsSize="sm"
            type="search"
            id="search"
            name="search"
            placeholder="Search"
          />
          {/* <Button outline color="info" size="sm" className="mr-sm-3">
              Search
            </Button> */}
        </FormGroup>
      </Form>
      <Component
        initialState={{ open: false }}
        toggleCb={({ open }: any) => ({ open: !open })}
        render={({ state, props, setState }: any) => (
          <Dropdown
            nav
            inNavbar
            group
            size="sm"
            isOpen={state.open}
            toggle={() => setState(props.toggleCb)}>
            <DropdownToggle nav caret />
            <DropdownMenu right>
              <DropdownItem onClick={() => auth.signOut()}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      />
    </Nav>
  </Navbar>
)
const headerStyle = css`
  height: var(--header-height);
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
    return (
      <div className={appStyle}>
        <Header />
        <Router>
          <Home path="/" />
          <Dashboard path="dashboard/*" />
          <Properties path="properties/*" />
          <Tenants path="tenants/*" />
          <Lease path="lease" />
          <NotFound default />
        </Router>
      </div>
    )
  }
}
const appStyle = css`
  display: grid;
  grid-template-rows: var(--header-height) calc(100vh - var(--header-height));
  height: 100vh;
  label: App;
`

export default App
