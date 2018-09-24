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
import {componentFromStream, createEventHandler} from 'recompose'
import {from, of, merge} from 'rxjs'
import {map, catchError, mapTo, switchMap, startWith} from 'rxjs/operators'

declare const firebase: FB

const noop = () => {}

interface LoginState {
  error?: string
  isModalOpen: boolean
  handleSubmit(): void
}
const Login = componentFromStream(props$ => {

  const {handler: clearError, stream: clearError$} = createEventHandler()
  const {handler: handleSubmit, stream: handleSubmit$} = createEventHandler()

  const emptyError$ = clearError$.pipe(mapTo({error: undefined, isModalOpen: true}))

  const form$ = handleSubmit$.pipe(
    switchMap((e: any) => {
    e.preventDefault()
    const {
      email: { value: email },
      password: { value: password },
    } = e.target.elements 
    return from(firebase
      .auth()
      .signInWithEmailAndPassword(email, password)).pipe(
        map(() => ({isModalOpen: false, error: undefined})),
        catchError((err: Error) => of({isModalOpen: true, error: err.message}))
      )
  }), startWith({isModalOpen: true, error: undefined}))

    return merge<LoginState>(form$, emptyError$).pipe(map<LoginState, any>(({isModalOpen, error}) =>
      <div>
        <Modal
          className={loginStyle}
          isOpen={isModalOpen}
          toggle={noop}
          backdrop="static">
          <ModalHeader className="title">Login</ModalHeader>
          <ModalBody>
            <Form
              onSubmit={handleSubmit}
              method="post"
              onFocus={clearError}>
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
    ))
})

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
