import React, { SFC } from 'react'
import Component from '@reactions/component'

interface LoginProps extends RouteProps {
  logIn: (email: string, password: string) => void
  error?: string
}

const Login: SFC<LoginProps> = ({ logIn, error }) => (
  <div>
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
          <form onSubmit={handleSubmit} method="post">
            {error && (
              <div>
                <h3 style={{ color: 'red' }}>{error}</h3>
              </div>
            )}
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required />
            </div>
            <div>
              <button>Log In</button>
            </div>
          </form>
        )
      }}
    />
  </div>
)

export default Login
