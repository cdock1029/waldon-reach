import * as React from 'react'
import { hot } from 'react-hot-loader'
import { Router, Link } from '@reach/router'
import '../App.css'

import Home from '@page/Home'
import Dashboard from '@page/Dashboard'
import Login from '@page/Login'

import logo from '../logo.svg'

const Something = (props: any) => <h3>something</h3>

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <div>
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
            </ul>
          </nav>
          <Router>
            <Home path="/">
              <Something path="/" />
            </Home>
            <Login path="login" />
            <Dashboard path="dashboard" />
          </Router>
        </div>
      </div>
    )
  }
}

export default hot(module)(App)
