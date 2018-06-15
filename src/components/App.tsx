import * as React from 'react'
import { Router, Link, Redirect } from '@reach/router'
import { FirebaseAuthConsumer } from '@comp/FirebaseAuth'
import { css } from 'react-emotion'

import Dashboard from '@page/Dashboard'
import Login from '@page/Login'
import {
  Button,
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

const NotFound: React.SFC<{ default?: boolean }> = () => <h1>Not found</h1>
const Header: React.SFC<{ logOut: any }> = ({ logOut }) => (
  <>
    <Navbar css={{ height: '56px' }} color="dark" dark expand="md">
      <NavbarBrand to="/" tag={props => <Link {...props}>Home</Link>} />
      <Nav navbar>
        <NavItem>
          <NavLink
            tag={props => (
              <Link getProps={isPartiallyActive(props.className)} {...props} />
            )}
            to="dashboard">
            Dashboard
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
                <DropdownItem onClick={logOut}>Log Out</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        />
      </Nav>
    </Navbar>
  </>
)

const Home: React.SFC<any> = () => (
  <div css={{ padding: '1em' }}>
    <h4>Home page</h4>
    <br />
    <Link to="dashboard">Dashboard</Link>
  </div>
)

class App extends React.Component {
  render() {
    return (
      <div
        css={`
          display: grid;
          grid-template-rows: 56px calc(100vh - 110px);
          height: 100vh;
        `}>
        <FirebaseAuthConsumer
          loading={() => <h1>Loading..</h1>}
          render={({ activeCompany, logOut }) => {
            return (
              <>
                <Header logOut={logOut} />
                <Router
                  css={{
                    position: 'relative',
                  }}>
                  <Home path="/" />
                  <Dashboard path="dashboard/*" activeCompany={activeCompany} />
                  <NotFound default />
                </Router>
              </>
            )
          }}
        />
      </div>
    )
  }
}

export default App
