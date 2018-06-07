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
          <form onSubmit={handleSubmit} method="post" onFocus={clearError}>
            {error && (
              <div>
                <h3 style={{ color: 'red' }}>{error}</h3>
              </div>
            )}
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
        )
      }}
    />
  </div>
)

const loginStyle = css`
  display: flex;
  flex-direction: column;
  border: 1px solid red;
  align-items: center;
  form {
    border: 1px solid navy;
    width: 300px;
    padding: 1em;
    .item {
      padding: 1em;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }
`

export default Login
