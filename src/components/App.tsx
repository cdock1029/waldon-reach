import * as React from 'react'
import { Router, Link, Redirect } from '@reach/router'
import { FirebaseAuthConsumer } from '@comp/FirebaseAuth'
import { css } from 'react-emotion'

import Dashboard from '@page/Dashboard'
import Login from '@page/Login'
import { Button, Navbar, Nav, NavItem, NavLink, NavbarBrand } from 'reactstrap'

const NotFound: React.SFC<{ default?: boolean }> = () => <h1>Not found</h1>
const DelayRedir: any = (props: any) => <Redirect {...props} />

const Header: React.SFC<{ logOut: any }> = ({ logOut }) => (
  <Navbar color="dark" dark expand="md">
    <NavbarBrand to="/" tag={props => <Link {...props}>Home</Link>} />
    <Nav className="ml-auto" navbar>
      {/* <Link className="btn btn-outline-secondary" to="/">
        Home
      </Link> */}
      <Button
        color="info"
        outline
        size="sm"
        className="logout"
        onClick={logOut}>
        Log Out
      </Button>
    </Nav>
  </Navbar>
)

class App extends React.Component {
  render() {
    return (
      <div
        css={`
          display: grid;
          grid-template-rows: 56px calc(100vh - 56px);
          height: 100vh;
        `}>
        <FirebaseAuthConsumer
          loading={() => <h1>Loading..</h1>}
          render={({
            user,
            activeCompany,
            logIn,
            logOut,
            error,
            clearError,
          }) => {
            return user ? (
              <>
                <Header logOut={logOut} />
                <Router
                  css={{
                    position: 'relative',
                  }}>
                  {/* <Home path="/" /> */}
                  <Dashboard path="/*" activeCompany={activeCompany} />
                  <Redirect from="login" to="dashboard" />
                  <NotFound default />
                </Router>
              </>
            ) : (
              <Router>
                <Login
                  path="login"
                  logIn={logIn!}
                  error={error}
                  clearError={clearError!}
                />
                <DelayRedir default to="login" />
              </Router>
            )
          }}
        />
      </div>
    )
  }
}

export default App
