import { app, User } from 'firebase/app'
import React from 'react'
import Login from '@page/Login'

interface AuthContext {
  hasLoaded: boolean
  user: User | null
  activeCompany: string
  logOut: () => Promise<any>
  logIn: (email: string, password: string) => void
  error?: string
  clearError: () => void
}
export interface AuthProps {
  authContext: AuthContext
}
const { Provider, Consumer } = React.createContext<AuthContext>({
  hasLoaded: false,
  user: null,
  activeCompany: '',
  logOut: async () => {},
  logIn: (email: string, password: string) => {},
  clearError: () => {},
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
    this.state = {
      user: null,
      hasLoaded: false,
      logIn: this.logIn,
      logOut: this.logOut,
      clearError: this.clearError,
      activeCompany: '',
    }
  }
  componentDidMount() {
    // console.log('Auth did mount: ', { state: this.state })
    const { firebase } = this.props
    const auth = firebase.auth!()
    this.unsub = auth.onAuthStateChanged(async user => {
      let activeCompany: string = ''
      if (user) {
        const refresh = !this.state.hasLoaded
        const result = await user.getIdTokenResult(refresh)
        activeCompany = result.claims.activeCompany
      }
      // setTimeout(() => {
      this.setState(() => ({ hasLoaded: true, user, activeCompany }))
      // }, 2000)
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
type AuthRender = (
  authContext: AuthContext,
) => JSX.Element | JSX.Element[] | null
interface AuthConsumerProps {
  render?: AuthRender
  children?: React.ReactNode | AuthRender
  tag?: React.Component
  loading?: any
  loginNoRedirect?: boolean
}
export const FirebaseAuthConsumer = ({
  render,
  children,
  tag,
  loading,
  loginNoRedirect = true,
  ...rest
}: AuthConsumerProps) => (
  <Consumer>
    {(authContext: AuthContext) => {
      if (loading && !authContext.hasLoaded) {
        const Loading: any = loading
        return <Loading />
      } else if (!authContext.hasLoaded) {
        return null
      }
      if (loginNoRedirect && authContext.hasLoaded && !authContext.user) {
        return (
          <Login
            logIn={authContext.logIn!}
            error={authContext.error}
            clearError={authContext.clearError!}
          />
        )
      }
      if (render) {
        return render(authContext)
      }
      if (typeof children === 'function') {
        return children(authContext)
      }
      // const chillens = React.Children.map(children, child =>
      //   React.cloneElement(child as React.ReactElement<any>, {
      //     ...authContext,
      //   }),
      // )
      let Comp: any
      if (tag) {
        Comp = tag
      }
      return Comp ? <Comp {...rest}>{children}</Comp> : children
    }}
  </Consumer>
)
export default class FirebaseAuth extends React.Component {
  static Provider = FirebaseAuthProvider
  static Consumer = FirebaseAuthConsumer
}
