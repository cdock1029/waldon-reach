import { app, User } from 'firebase/app'
import React from 'react'

interface AuthContext {
  hasLoaded: boolean
  user: User | null
  activeCompany?: string
  logOut?: () => Promise<any>
  logIn?: (email: string, password: string) => void
  error?: string
  clearError?: () => void
}
export interface AuthProps {
  authContext: AuthContext
}
const { Provider, Consumer } = React.createContext<AuthContext>({
  hasLoaded: false,
  user: null,
})

export interface ProviderProps {
  firebase: app.App
}
export class FirebaseAuthProvider extends React.Component<
  ProviderProps,
  AuthContext
> {
  private unsub: () => void
  constructor(props: ProviderProps) {
    super(props)
    const currentUser = props.firebase.auth!().currentUser
    this.state = {
      user: currentUser,
      hasLoaded: Boolean(currentUser),
      logIn: this.logIn,
      logOut: this.logOut,
      clearError: this.clearError,
    }
  }
  componentDidMount() {
    const { firebase } = this.props
    const auth = firebase.auth!()
    this.unsub = auth.onAuthStateChanged(async user => {
      /*
      let activeCompany: string | undefined
      if (user) {
        const refresh = !this.state.hasLoaded
        const result = await user.getIdTokenResult(refresh)
        activeCompany = result.claims.activeCompany
      }
      this.setState(() => ({ hasLoaded: true, user, activeCompany }))
      TODO testing injecting company at build..
      */
      this.setState(() => ({ hasLoaded: true, user }))
    })
  }
  componentWillUnmount() {
    if (this.unsub) {
      this.unsub()
    }
  }
  logOut = () => this.props.firebase.auth!().signOut()
  logIn = (email: string, password: string) => {
    // try {
    //   firebase.auth().signInWithEmailAndPassword(email, password)
    // } catch (err) {
    //   console.log({ err })
    //   console.log('caught error.....')
    //   this.setState({ error: err.message })
    // }
    console.log({ email: `[${email}]`, password: `[${password}]` })
    this.props.firebase.auth!()
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
        console.log('DOT.catch error.....')
        console.log({ error })
        this.setState({ error: error.message })
      })
  }
  clearError = () =>
    this.setState(
      ({ error }: Pick<AuthContext, 'error'>) =>
        error ? { error: undefined } : null,
    )

  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>
  }
}
type AuthRender = (authContext: AuthContext) => JSX.Element | JSX.Element[]
interface AuthConsumerProps {
  render?: AuthRender
  children?: React.ReactNode | AuthRender
  tag?: React.Component
}
export const FirebaseAuthConsumer = ({
  render,
  children,
  tag,
  ...rest
}: AuthConsumerProps) => {
  if (render) {
    return (
      <Consumer>{(authContext: AuthContext) => render(authContext)}</Consumer>
    )
  }
  if (typeof children === 'function') {
    return (
      <Consumer>{(authContext: AuthContext) => children(authContext)}</Consumer>
    )
  }
  return (
    <Consumer>
      {(authContext: AuthContext) => {
        const chillens = React.Children.map(children, child =>
          React.cloneElement(child as React.ReactElement<any>, {
            ...authContext,
            ...rest,
          }),
        )
        let Comp: any
        if (tag) {
          Comp = tag
        }
        return Comp ? <Comp>{chillens}</Comp> : chillens
      }}
    </Consumer>
  )
}
export default class FirebaseAuth extends React.Component {
  static Provider = FirebaseAuthProvider
  static Consumer = FirebaseAuthConsumer
}
