import React from 'react'
import {
  Collapse,
  NavbarToggler,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
  Button,
  Form,
} from 'reactstrap'
import { Link } from '@reach/router'
import loadable from 'loadable-components'

const ZenConsumer = loadable(() =>
  import('../shared/components/Zen').then(mod => mod.ZenConsumer),
)

declare const firebase: typeof import('firebase')

export class Header extends React.Component<{}, { isOpen: boolean }> {
  state = {
    isOpen: false,
  }
  toggle = () => this.setState(({ isOpen }) => ({ isOpen: !isOpen }))
  signOut = (e: any) => {
    e.preventDefault()
    firebase.auth().signOut()
  }
  render() {
    return (
      <Navbar color="dark" dark expand="md" fixed="top">
        <NavbarToggler className="ml-auto" onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <NavbarBrand to="/" tag={props => <Link {...props} />}>
            WPM
          </NavbarBrand>
          <Nav className="ml-auto" navbar>
            <Form inline>
              <ZenConsumer>
                {({ value, toggle }) => (
                  <Button className="mx-2" size="sm" outline onClick={toggle}>
                    Zen is {value ? 'on' : 'off'}
                  </Button>
                )}
              </ZenConsumer>
            </Form>
            <NavItem>
              <NavLink tag={p => <Link {...p} />} to="todos">
                Todos
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={p => <Link {...p} />} to="search">
                Search
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={p => <Link {...p} />} to="qbo">
                QBO
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink href="#" onClick={this.signOut}>
                Sign Out
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    )
  }
}
