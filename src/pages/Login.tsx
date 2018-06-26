import React from 'react'
import { css } from 'react-emotion'
import { auth } from '@lib/firebase'

interface LoginState {
  error?: string
}
class Login extends React.Component<{}, LoginState> {
  state: LoginState = {}
  clearError = () =>
    this.setState(
      ({ error }: Pick<LoginState, 'error'>) =>
        error ? { error: undefined } : null,
    )
  handleSubmit = (e: any) => {
    e.preventDefault()
    const {
      email: { value: email },
      password: { value: password },
    } = e.target.elements
    auth.signInWithEmailAndPassword(email, password).catch(error => {
      this.setState({ error: error.message })
    })
  }
  render() {
    const error = this.state.error
    return (
      <div className={loginStyle}>
        <h3>Login</h3>
        <div>
          {error && <div className="error">{error}</div>}
          <form
            onSubmit={this.handleSubmit}
            method="post"
            onFocus={this.clearError}>
            <div className="item">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div className="item">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required />
            </div>
            <div className="item">
              <button>Log In</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

const loginStyle = css`
  margin: 1.5em auto;
  .error {
    color: red;
  }
  form {
    min-width: 300px;
  }
`

export default Login
