import * as React from 'react'
import { Router, Link, Redirect } from '@reach/router'
import { FirebaseAuthConsumer } from '@comp/FirebaseAuth'
import Component from '@reactions/component'
import '../App.css'

import Home from '@page/Home'
import Dashboard from '@page/Dashboard'
import Login from '@page/Login'

import logo from '../logo.svg'

const NotFound: React.SFC<{ default?: boolean }> = () => <h1>Not found</h1>

const DelayRedir: any = (props: any) => <Redirect {...props} />

const ShowUser: any = ({ user }: any) => (
  <div>
    <p>{user ? user.email : 'no user'}</p>
  </div>
)

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <FirebaseAuthConsumer
          render={({ user, hasLoaded, logIn, logOut, error, clearError }) => {
            if (!hasLoaded) {
              return <h1>Loading..</h1>
            }
            return (
              <>
                <nav>
                  <ul>
                    <li>
                      <Link to="/">Home</Link>
                    </li>
                    <li>
                      <Link to="dashboard">Dashboard</Link>
                    </li>
                    <li />
                    <li>
                      {user ? (
                        <button onClick={logOut}>Log Out</button>
                      ) : (
                        <Link to="login">Login</Link>
                      )}
                    </li>
                  </ul>
                </nav>
                {user ? (
                  <Router>
                    <Home path="/" />
                    <Dashboard path="dashboard" />
                    <Redirect from="login" to="dashboard" />
                    <NotFound default />
                  </Router>
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
                )}
              </>
            )
          }}
        />
      </div>
    )
  }
}

/* <Component
                      key="compcomp"
                      default
                      initialState={{ mounted: false }}
                      didMount={({ setState }: any) =>
                        setState({ mounted: true })
                      }
                      render={({ state }: any) => {
                        console.log({ mounted: state.mounted })
                        return true ? (
                          <Redirect noThrow to="login" />
                        ) : null
                      }}
                    /> */

export default App
