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

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <FirebaseAuthConsumer
          render={({ user, hasLoaded, logIn, logOut, error }) => {
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
                    <li>
                      <Link to="login">Login</Link>
                    </li>
                    {user && (
                      <li>
                        <button onClick={logOut}>Log Out</button>
                      </li>
                    )}
                  </ul>
                </nav>
                {user ? (
                  <Router>
                    <Home key="/" path="/" />
                    <Dashboard key="dash" path="dashboard" />
                    <NotFound key="nf" default />
                  </Router>
                ) : (
                  <Router>
                    <Login
                      key="login"
                      path="login"
                      logIn={logIn!}
                      error={error}
                    />
                    <DelayRedir default to="login" />
                    {/* <Component
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
                    /> */}
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

export default App
