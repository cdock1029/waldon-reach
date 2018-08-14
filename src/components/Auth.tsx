import React from 'react'
import { app, onAuthStateChangedWithClaims } from '../lib/firebase'

type App = firebase.app.App
type UserCredential = firebase.auth.UserCredential
type User = firebase.User

interface AuthProviderProps {
  firebase?(): App
  claims?: string[]
  children?: JSX.Element | JSX.Element[]
}

export interface AuthProviderState {
  user: User | null
  claims: {
    [key: string]: string | undefined
  }
  signOut(): Promise<void>
  signIn(email: string, password: string): Promise<UserCredential | void>
}

const { Consumer, Provider } = React.createContext<AuthProviderState>({
  user: null,
  claims: {},
  signOut: () => Promise.resolve(),
  signIn: (email: string, password: string) => Promise.resolve(),
})

export class AuthProvider extends React.Component<
  AuthProviderProps,
  AuthProviderState
> {
  unsub: Unsub
  static defaultProps: AuthProviderProps = {
    firebase: app,
    claims: [],
  }
  constructor(props: AuthProviderProps) {
    super(props)
    // const claims = this.props.claims!.reduce((acc, claim) => {
    //   acc[claim] = null
    //   return acc
    // }, {})
    // const auth = this.props.firebase!().auth!()
    this.state = {
      user: null, //app().auth().currentUser,
      claims: {},
      signOut: () =>
        app()
          .auth()
          .signOut(),
      signIn: (email, password) =>
        app()
          .auth()
          .signInWithEmailAndPassword(email, password),
    }
    this.unsub = onAuthStateChangedWithClaims(
      this.props.claims!,
      this.handleAuthChange,
    )
  }
  componentWillUnmount() {
    this.unsub()
  }
  handleAuthChange = (user: User | null, claims: { [key: string]: string }) => {
    this.setState(() => ({ user, claims }))
  }
  render() {
    // console.log('render auth provider', { state: this.state })
    return <Provider value={this.state}>{this.props.children}</Provider>
  }
}

interface AuthConsumerProps {
  children(state: AuthProviderState): React.ReactNode
}
export class AuthConsumer extends React.Component<AuthConsumerProps> {
  render() {
    return <Consumer>{state => this.props.children(state)}</Consumer>
  }
}

export default ({ claims, children }: AuthConsumerProps & { claims: any }) => (
  <AuthProvider claims={claims}>
    <AuthConsumer>{children}</AuthConsumer>
  </AuthProvider>
)
