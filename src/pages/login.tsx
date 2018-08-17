import React from 'react'
import { css } from 'react-emotion'
import {
  Button,
  Form,
  FormGroup,
  Input,
  FormText,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
} from 'reactstrap'
import { app } from '../lib/firebase'

interface LoginState {
  error?: string
  isModalOpen: boolean
}
class Login extends React.Component<{}, LoginState> {
  state: LoginState = {
    isModalOpen: true,
  }
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
    app()
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.setState({ isModalOpen: false }))
      .catch(error => {
        this.setState({ error: error.message })
      })
  }
  noop() {}
  render() {
    const { error, isModalOpen } = this.state
    return (
      <div>
        <Modal
          className={loginStyle}
          isOpen={isModalOpen}
          toggle={this.noop}
          backdrop="static">
          <ModalHeader className="title">Login</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={this.handleSubmit}
              method="post"
              onFocus={this.clearError}>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Button block className="btn-tenants">
                  Log In
                </Button>
              </FormGroup>
              <FormGroup>
                <FormText color="danger">{error || '\u00A0'}</FormText>
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </div>
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
