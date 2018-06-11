import React, { SFC } from 'react'
import Component from '@reactions/component'
import { css } from 'react-emotion'

interface LoginProps extends RouteProps {
  logIn: (email: string, password: string) => void
  error?: string
  clearError: () => void
}

const Login: SFC<LoginProps> = ({ logIn, error, clearError }) => (
  <div className={loginStyle}>
    <h3>Login</h3>
    <Component
      handleSubmit={(e: any) => {
        e.preventDefault()
        const {
          email: { value: email },
          password: { value: password },
        } = e.target.elements
        console.log({ email, password })
        logIn(email, password)
      }}
      render={({ props: { handleSubmit } }: any) => {
        // console.log({ stuff })
        return (
          <div>
            {error && <h3 style={{ color: 'red' }}>{error}</h3>}
            <form onSubmit={handleSubmit} method="post" onFocus={clearError}>
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
        )
      }}
    />
  </div>
)

const loginStyle = css`
  border: 1px solid red;
  justify-content: center;
  form {
    border: 1px solid navy;
    min-width: 300px;
    padding: 1em;
    .item {
      /* min-height: 100px; */
      padding: 1em;
      grid-template-columns: auto auto;
      justify-content: space-between;
      align-items: center;
      & > * {
        margin: 0.5em;
      }
    }
  }
`

export default Login
