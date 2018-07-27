import React from 'react'
import { app } from '../lib/firebase'

type App = firebase.app.App
type UserCredential = firebase.auth.UserCredential
type User = firebase.User

interface AuthProviderProps {
  firebase?: App
  claims?: string[]
  children: JSX.Element | JSX.Element[]
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
  static defaultProps = {
    firebase: app,
    claims: [],
  }
  constructor(props: AuthProviderProps) {
    super(props)
    const claims = this.props.claims!.reduce((acc, claim) => {
      acc[claim] = null
      return acc
    }, {})
    const auth = this.props.firebase!.auth!()
    this.state = {
      user: auth.currentUser,
      claims,
      signOut: () => auth.signOut(),
      signIn: (email, password) =>
        auth.signInWithEmailAndPassword(email, password),
    }
    this.unsub = auth.onAuthStateChanged(this.handleAuthChange)
  }
  componentWillUnmount() {
    this.unsub()
  }
  handleAuthChange = async (user: User) => {
    let claims = {}
    if (user && this.props.claims!.length) {
      const tokenResult = await user.getIdTokenResult()
      claims = this.props.claims!.reduce((acc, claim) => {
        acc[claim] = tokenResult.claims[claim]
        return acc
      }, claims)
    }
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
    // console.log('render auth consumer')
    return <Consumer>{state => this.props.children(state)}</Consumer>
  }
}
