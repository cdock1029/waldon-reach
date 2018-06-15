import React, { SFC } from 'react'
import { Collection } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
import { Property, Unit } from '../types'
import Component from '@reactions/component'
import {
  ListGroup,
  ListGroupItem,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardText,
  CardTitle,
  Navbar,
  Nav,
  Form,
  FormGroup,
  Input,
  Button,
} from 'reactstrap'
import { collator, isPartiallyActive } from '@lib/index'
import NewUnitForm from '@comp/NewUnitForm'

interface DashboardProps {
  activeCompany?: string
}

class Properties extends Collection<Property> {}
class Units extends Collection<Unit> {}

const PropertyDetail = (props: any) => {
  console.log({ props })
  return (
    <div css={{ padding: '1em' }}>
      <small>Property id: {props.propertyId}</small>
      {props.children}
    </div>
  )
}
const UnitDetail = ({ propertyId, unitId }: any) => {
  return (
    <div>
      <h4>P: {propertyId}</h4>
      <small>Uid: {unitId}</small>
    </div>
  )
}

const showAlert = () => alert('yo')

const Dashboard: SFC<RouteProps & DashboardProps> = ({
  activeCompany,
  ...rest
}) => {
  console.log({ rest })
  return (
    <Properties
      path={`companies/${activeCompany}/properties`}
      orderBy={{ field: 'name', direction: 'asc' }}
      render={properties => {
        return (
          <div
            css={{
              display: 'grid',
              gridTemplateAreas: `
                "header header"
                "props dash"
                "props dash"
                "units dash"
                "units dash"
                "units dash"
              ;`,
              gridTemplateColumns: 'minmax(0, 250px) 1fr',
              gridTemplateRows:
                '47px repeat(5, calc((100vh - calc(56px + 47px)) / 5))',
            }}>
            <div
              css={{
                gridArea: 'header',
              }}>
              <Navbar color="secondary" light expand="md">
                <Nav navbar css={{ marginLeft: 'auto' }}>
                  <Form inline>
                    <FormGroup className="mr-sm-2">
                      <Input
                        className="mr-sm-2"
                        bsSize="sm"
                        type="search"
                        id="search"
                        name="search"
                        placeholder="search"
                      />
                      <Button size="sm">Search</Button>
                    </FormGroup>
                  </Form>
                </Nav>
              </Navbar>
            </div>
            <div
              css={{
                gridArea: 'dash',
              }}>
              <Router>
                <PropertyDetail path=":propertyId">
                  <UnitDetail path="units/:unitId" />
                </PropertyDetail>
              </Router>
            </div>
            <div
              css={{
                gridArea: 'props',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
              }}>
              <Component
                initialState={{ modal: false }}
                toggleCallback={({ modal }: any) => ({ modal: !modal })}
                render={({
                  setState,
                  props: { toggleCallback },
                  state,
                }: any) => (
                  <>
                    <h6
                      className="bg-light"
                      css={{
                        padding: '0.5em',
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      Properties{' '}
                      <Badge
                        css={{ cursor: 'pointer' }}
                        color="secondary"
                        onClick={() => setState(toggleCallback)}>
                        New
                      </Badge>
                    </h6>
                  </>
                )}
              />
              <ListGroup
                css={`
                  /* max-height: 100%; */
                  flex: 1;
                  overflow-y: scroll;
                `}
                flush>
                {properties.map(p => {
                  return (
                    <ListGroupItem
                      action
                      key={p.id}
                      to={p.id}
                      tag={props => {
                        const fn: any = isPartiallyActive(props.className)
                        return <Link getProps={fn} {...props} />
                      }}>
                      {p.name}
                    </ListGroupItem>
                  )
                })}
              </ListGroup>
            </div>
            <Router
              css={{
                gridArea: 'units',
                paddingBottom: '1em',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}>
              <Component
                path=":propertyId/*"
                render={({ props: { propertyId } }: any) => {
                  return (
                    <Units
                      key={propertyId}
                      path={`companies/${activeCompany}/properties/${propertyId}/units`}
                      transform={units =>
                        units.sort((a, b) =>
                          collator.compare(a.address, b.address),
                        )
                      }
                      render={(units, hasLoaded) => {
                        return (
                          <>
                            <Component
                              initialState={{ modal: false }}
                              toggleCallback={({ modal }: any) => ({
                                modal: !modal,
                              })}
                              render={({
                                setState,
                                props: { toggleCallback },
                                state,
                              }: any) => (
                                <h6
                                  className="bg-light"
                                  css={{
                                    padding: '0.5em',
                                    margin: 0,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                  }}>
                                  Units{' '}
                                  <Badge
                                    css={{ cursor: 'pointer' }}
                                    onClick={() => setState(toggleCallback)}
                                    color="secondary">
                                    New
                                  </Badge>
                                  <NewUnitForm
                                    activeCompany={activeCompany!}
                                    propertyId={propertyId}
                                    isModalOpen={state.modal}
                                    toggleModal={() => setState(toggleCallback)}
                                  />
                                </h6>
                              )}
                            />
                            <ListGroup
                              flush
                              css={`
                                /* max-height: 100%; */
                                flex: 1;
                                overflow-y: scroll;
                                /*.list-group-item-action.active {
                                  color: #fff;
                                  background-color: var(--info);
                                  border-color: #0c5460;
                                }*/
                              `}>
                              {units.length ? (
                                units.map(u => {
                                  return (
                                    <ListGroupItem
                                      action
                                      key={u.id}
                                      to={`units/${u.id}`}
                                      tag={props => {
                                        return (
                                          <Link
                                            getProps={isPartiallyActive(
                                              props.className,
                                            )}
                                            {...props}
                                          />
                                        )
                                      }}>
                                      {u.address}
                                    </ListGroupItem>
                                  )
                                })
                              ) : hasLoaded ? (
                                <div css={{ padding: '1em' }}>
                                  <Card body>
                                    <CardTitle>No units</CardTitle>
                                    <CardText>
                                      click <code>New</code> to create a new
                                      unit
                                    </CardText>
                                  </Card>
                                </div>
                              ) : null}
                            </ListGroup>
                          </>
                        )
                      }}
                    />
                  )
                }}
              />
            </Router>
          </div>
        )
      }}
    />
  )
}

export default Dashboard
