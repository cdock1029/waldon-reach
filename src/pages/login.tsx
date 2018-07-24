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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap'
import { AuthConsumer as Auth } from '../components/Auth'
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
  handleSubmit = (
    e: any,
    signIn: (email: string, password: string) => Promise<any>,
  ) => {
    e.preventDefault()
    const {
      email: { value: email },
      password: { value: password },
    } = e.target.elements
    console.log({ email, password })
    signIn(email, password).catch(error => {
      this.setState({ error: error.message })
    })
  }
  render() {
    const error = this.state.error
    return (
      <Auth>
        {auth => {
          const doShowModal =
            !auth.user && process.env.REACT_STATIC_ENV !== 'node'
          return (
            <Modal isOpen={doShowModal} toggle={() => {}}>
              <ModalHeader toggle={() => {}}>Modal title</ModalHeader>
              <ModalBody>
                <div className={loginStyle}>
                  <h3>Login</h3>
                  <Card className="form-wrap">
                    <Form
                      onSubmit={e => this.handleSubmit(e, auth.signIn)}
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
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                        />
                      </FormGroup>
                      <Button block>Log In</Button>
                    </Form>
                  </Card>
                </div>
              </ModalBody>
              {/* <ModalFooter>
                <Button
                  color="primary"
                  onClick={(e: any) => this.handleSubmit(e, auth.signIn)}>
                  Sign In
                </Button>{' '}
              </ModalFooter> */}
            </Modal>
          )
        }}
      </Auth>
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
