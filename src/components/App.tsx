import * as React from 'react'
import { BrowserRouter, Switch, Route, NavLink as Link } from 'react-router-dom'
import { AuthProvider, AuthConsumer as Auth } from './Auth'
import {
  Collapse,
  NavbarToggler,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
  Form,
  FormGroup,
  Input,
} from 'reactstrap'
import styled from 'react-emotion'
import Loadable from 'react-loadable'
import Login from '../pages/login'

const Loading = ({ pastDelay }: any) => (pastDelay ? <h1>Loading..</h1> : null)
const loadDefaults = {
  loading: Loading,
  delay: 400,
}

const Dash = Loadable({
  loader: () => import('../pages/dash'),
  ...loadDefaults,
})
const Lease = Loadable({
  loader: () => import('../pages/lease'),
  ...loadDefaults,
})

class Header extends React.Component<{}, { isOpen: boolean }> {
  state = {
    isOpen: false,
  }
  toggle = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  render() {
    return (
      <Navbar
        css={`
          /* box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2); */
        `}
        color="gradient-dark"
        dark
        expand="md"
        fixed="top">
        {/* <Nav className="mr-auto" navbar>
          <Form inline>
            <FormGroup className="mx-sm-2 mb-0">
              <Input
                className="mr-sm-3"
                bsSize="sm"
                type="search"
                id="search"
                name="search"
                placeholder="Search"
              />
            </FormGroup>
          </Form>
        </Nav> */}
        <NavbarToggler className="ml-auto" onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <NavbarBrand to="/" tag={Link}>
            WPM
          </NavbarBrand>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <Auth>
                {auth =>
                  auth.user ? (
                    <NavLink
                      href="#"
                      onClick={(e: any) => {
                        e.preventDefault()
                        auth.signOut()
                      }}>
                      Sign Out
                    </NavLink>
                  ) : null
                }
              </Auth>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}

class App extends React.Component {
  render() {
    return (
      <AuthProvider claims={['activeCompany']}>
        <BrowserRouter>
          <AppContainer>
            <Login />
            <Header />
            <Main>
              <Switch>
                <Route path="/" exact component={Dash} />
                <Route path="/lease" component={Lease} />
              </Switch>
            </Main>
          </AppContainer>
        </BrowserRouter>
      </AuthProvider>
    )
  }
}
const AppContainer = styled.div`
  height: 100vh;
`
const Main = styled.main`
  padding-top: 56px;
  height: 100%;
`

export default App
