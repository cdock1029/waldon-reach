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
} from 'reactstrap'
import { AuthConsumer as Auth } from '../components/Auth'
import { notBuilding } from '../lib'

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
          // show modal if not building and user is not logged in
          const doShowModal = notBuilding() && !auth.user
          return (
            <Modal
              className={loginStyle}
              isOpen={doShowModal}
              toggle={() => {}}>
              <ModalHeader className="title">Login</ModalHeader>
              <ModalBody>
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
                    {/* <Label htmlFor="email">Email</Label> */}
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    {/* <Label htmlFor="password">Password</Label> */}
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Button block color="primary">
                      Log In
                    </Button>
                  </FormGroup>
                </Form>
              </ModalBody>
            </Modal>
          )
        }}
      </Auth>
    )
  }
}

const loginStyle = css`
  /* margin: 1.5em auto;
  max-width: 300px; */
  .title {
    margin: 0;
    line-height: 1.5;
  }
  .modal-body {
    padding: 2em 2.5em;
    button {
      margin-top: 1.5rem;
    }
  }
`

export default Login
