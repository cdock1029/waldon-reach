import React from 'react'
import { css } from 'react-emotion'
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Card,
} from 'reactstrap'
import { auth } from '../lib/firebase'

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
        <Card className="form-wrap">
          <Form
            onSubmit={this.handleSubmit}
            method="post"
            onFocus={this.clearError}>
            {error && (
              <FormGroup>
                <FormText color="danger">{error}</FormText>
              </FormGroup>
            )}
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </FormGroup>
            <Button block>Log In</Button>
          </Form>
        </Card>
      </div>
    )
  }
}

const loginStyle = css`
  margin: 1.5em auto;
  max-width: 300px;
  .form-wrap,
  button {
    margin-top: 1.5rem;
  }
  form {
    padding: 1.5rem;
  }
`

export default Login
