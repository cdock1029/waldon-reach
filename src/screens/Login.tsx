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
import { componentFromStream, createEventHandler } from 'recompose'
import { from, of, merge, combineLatest } from 'rxjs'
import {
  map,
  catchError,
  mapTo,
  switchMap,
  startWith,
  scan,
} from 'rxjs/operators'
import { StreamForm } from './components/StreamForm'
import { isEmpty } from 'ramda'

declare const firebase: FB

const noop = () => {}

interface LoginState {
  error?: string
  isModalOpen: boolean
  handleSubmit(): void
}
const Login = componentFromStream(props$ => {
  const { handler: clearError, stream: clearError$ } = createEventHandler()

  const { handler: handleSubmit, stream: handleSubmit$ } = createEventHandler()
  const { handler: handleChange, stream: handleChange$ } = createEventHandler()
  const { handler: handleBlur, stream: handleBlur$ } = createEventHandler()

  const emptyError$ = clearError$.pipe(
    mapTo({ error: undefined, isModalOpen: true }),
  )

  const initialValues = { email: '', password: '' }
  const values$ = handleChange$.pipe(
    map((e: React.FormEvent<HTMLInputElement>) => {
      return { [e.currentTarget.name]: e.currentTarget.value }
    }),
    scan((acc, value) => {
      return { ...acc, ...value }
    }, initialValues),
    startWith(initialValues),
  )

  const initialTouched = {}
  const touched$ = handleBlur$.pipe(
    map((e: React.FormEvent<HTMLInputElement>) => {
      return { [e.currentTarget.name]: true }
    }),
    scan((acc, value) => {
      return { ...acc, ...value }
    }, initialTouched),
    startWith(initialTouched),
  )

  const form$ = combineLatest<LoginState, any, any>(
    merge<LoginState, LoginState>(
      handleSubmit$.pipe(
        switchMap((e: any) => {
          e.preventDefault()
          const {
            email: { value: email },
            password: { value: password },
          } = e.target.elements
          return from(
            firebase.auth().signInWithEmailAndPassword(email, password),
          ).pipe(
            map(() => ({ isModalOpen: false, error: undefined })),
            catchError((err: Error) =>
              of({ isModalOpen: true, error: err.message }),
            ),
          )
        }),
        startWith({ isModalOpen: true, error: undefined }),
      ),
      emptyError$,
    ),
    values$,
    touched$,
  ).pipe(
    map(([loginState, values, touched]) => ({
      ...loginState,
      values,
      touched,
    })),
  )

  return form$.pipe(
    map(({ isModalOpen, error, values, touched }) => (
      <div>
        <Modal
          className={loginStyle}
          isOpen={isModalOpen}
          toggle={noop}
          backdrop="static">
          <ModalHeader className="title">Login</ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit} method="post" onFocus={clearError}>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange}
                  onBlur={handleBlur}
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
                  onChange={handleChange}
                  onBlur={handleBlur}
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
            <br />
            <StreamForm
              initialValues={{
                name: '',
                age: 0,
              }}
              rules={{
                name: [
                  [(name: string) => !isEmpty(name), 'No empty name'],
                  [
                    (name: string) => name.length >= 3,
                    'Name must be 3 or more letters',
                  ],
                ],
                age: [[(age: number) => age > 10, 'Must be older than 10']],
              }}
              onSubmit={(vals: any) => alert(JSON.stringify(vals, null, 2))}>
              {({
                handleSubmit: hs,
                handleChange: hc,
                handleBlur: hb,
                values: vals,
                reset,
                errors,
                touched: tchd,
              }: any) => {
                return (
                  <div>
                    <form onSubmit={hs}>
                      <div>
                        <label>name</label>
                        <input
                          type="text"
                          name="name"
                          value={vals.name}
                          onChange={hc}
                          onBlur={hb}
                        />
                      </div>
                      <div>
                        <label>age</label>
                        <input
                          type="number"
                          name="age"
                          value={vals.age}
                          onChange={hc}
                          onBlur={hb}
                        />
                      </div>
                      <div>
                        <button type="submit">Submit</button>
                      </div>
                      <div>
                        <button type="button" onClick={reset}>
                          Reset
                        </button>
                      </div>
                      <div>
                        <pre>
                          {JSON.stringify(
                            { vals, errors, touched: tchd },
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </form>
                  </div>
                )
              }}
            </StreamForm>
          </ModalBody>
        </Modal>
      </div>
    )),
  )
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
