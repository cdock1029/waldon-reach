import * as React from 'react'
import { Router, Link, Redirect } from '@reach/router'
import { FirebaseAuthConsumer } from '@comp/FirebaseAuth'
import { css } from 'react-emotion'

import Dashboard from '@page/Dashboard'
import Login from '@page/Login'
import { Button } from 'reactstrap'

const NotFound: React.SFC<{ default?: boolean }> = () => <h1>Not found</h1>
const DelayRedir: any = (props: any) => <Redirect {...props} />

const Header: React.SFC<{ logOut: any }> = ({ logOut }) => (
  <nav className={headerStyles}>
    <Link to="/">Home</Link>
    {/* <Link to="dashboard">Dashboard</Link> */}
    <Button className="logout" onClick={logOut}>
      Log Out
    </Button>
  </nav>
)
const headerStyles = css`
  border: 1px solid navy;
  padding: 0 1em;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  a {
    margin-right: 1.5em;
    border: 1px solid navy;
    padding: 0.5em 1em;
    text-decoration: none;
  }
  .logout {
    margin-left: auto;
  }
`

class App extends React.Component {
  render() {
    return (
      <div
        css={`
          display: grid;
          grid-template-rows: 60px 1fr;
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
                <Router>
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
