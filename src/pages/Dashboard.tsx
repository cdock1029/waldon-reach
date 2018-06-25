import React, { SFC } from 'react'
import { Collection } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
import { Property, Unit, Tenant } from '../types'
import Component from '@reactions/component'
import {
  ListGroup,
  ListGroupItem,
  Badge,
  Card,
  CardBody,
  CardText,
  CardTitle,
  CardSubtitle,
} from 'reactstrap'
import { collator, isPartiallyActive } from '@lib/index'
import NewUnitForm from '@comp/NewUnitForm'
import LeaseView from '@comp/LeaseView'
import { Document } from '@comp/FirestoreData'
import { auth } from '@lib/firebase'

class PropertiesCollection extends Collection<Property> {}
class UnitsCollection extends Collection<Unit> {}
class TenantsCollection extends Collection<Tenant> {}

class PropertyDoc extends Document<Property> {}
class UnitDoc extends Document<Unit> {}
class TenantDoc extends Document<Tenant> {}

const Dashboard: SFC<RouteProps> = () => (
  <Router>
    <DashIndex path="/" />
    <Properties path="properties/*" />
    <Tenants path="tenants">
      <TenantDetail path=":tenantId">
        <LeaseView path="/" />
      </TenantDetail>
    </Tenants>
  </Router>
)
const DashIndex: SFC<RouteProps> = () => {
  const user = auth.currentUser!
  const name = user.displayName ? user.displayName : user.email
  return (
    <div css={{ padding: '1em' }}>
      <h5>Dashboard</h5>
      <hr />
      <div>
        <ul>
          <li>User: {name}</li>
        </ul>
      </div>
      <hr />
      <div>
        <Link to="../">{'< '}Back Home</Link>
      </div>
      <div>
        <Link to="properties">Properties</Link>
      </div>
      <div>
        <Link to="tenants">Tenants</Link>
      </div>
    </div>
  )
}

interface PropertyDetailProps {
  propertyId?: string
}
const PropertyDetail: SFC<PropertyDetailProps & RouteProps> = ({
  propertyId,
  children,
}) => {
  const routes = React.Children.map(children, child =>
    React.cloneElement(child as React.ReactElement<any>, {
      key: propertyId,
    }),
  )
  return (
    <>
      <PropertyDoc
        path={`companies/${auth.activeCompany}/properties/${propertyId}`}
        render={property => (
          <div css={{ padding: '1em' }}>
            <Card>
              <CardBody>
                <CardTitle>{property && property.name}</CardTitle>
                <CardText>Property</CardText>
              </CardBody>
            </Card>
          </div>
        )}
      />
      {routes}
    </>
  )
}

interface UnitDetailProps {
  propertyId?: string
  unitId?: string
}
const UnitDetail: SFC<UnitDetailProps & RouteProps> = ({
  propertyId,
  unitId,
  children,
}) => {
  return (
    <>
      <UnitDoc
        path={`companies/${
          auth.activeCompany
        }/properties/${propertyId}/units/${unitId}`}
        render={unit =>
          unit ? (
            <div css={{ padding: '1em' }}>
              <Card>
                <CardBody>
                  <CardSubtitle>{unit.address}</CardSubtitle>
                  <CardText>Unit</CardText>
                </CardBody>
              </Card>
            </div>
          ) : null
        }
      />
      {React.Children.map(children, child =>
        React.cloneElement(child as React.ReactElement<any>, {
          key: `${propertyId}${unitId}`,
        }),
      )}
    </>
  )
}

const TenantDetail: SFC<RouteProps & { tenantId?: string }> = props => {
  return (
    <>
      <TenantDoc
        path={`companies/${auth.activeCompany}/tenants/${props.tenantId}`}
        render={tenant => (
          <div css={{ padding: '1em' }}>
            <Card>
              <CardBody>
                <CardSubtitle>
                  {tenant && `${tenant.firstName} ${tenant.lastName}`}
                </CardSubtitle>
                <CardText>Tenant</CardText>
              </CardBody>
            </Card>
          </div>
        )}
      />
      {React.Children.map(props.children, child =>
        React.cloneElement(child as React.ReactElement<any>, {
          key: props.tenantId,
        }),
      )}
    </>
  )
}

const Tenants: SFC<RouteProps> = ({ children }) => {
  return (
    <TenantsCollection
      path={`companies/${auth.activeCompany}/tenants`}
      orderBy={{ field: 'lastName', direction: 'asc' }}
      render={(tenants, hasLoaded) => {
        if (!hasLoaded) {
          return null
        }
        if (!tenants.length) {
          return <h3>TODO no tenants</h3>
        }
        return (
          <div
            css={{
              display: 'grid',
              gridTemplateAreas: `
                "tenants lease"
              ;`,
              gridTemplateColumns: 'minmax(0, 250px) 1fr',
              gridTemplateRows: 'calc(100vh - 56px)',
            }}>
            <div
              css={{
                gridArea: 'tenants',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
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
                      Tenants{' '}
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
                  flex: 1;
                  overflow-y: scroll;
                `}
                flush>
                {tenants.map(t => {
                  return (
                    <ListGroupItem
                      css={`
                        &.list-group-item.list-group-item-action.active {
                          color: #fff;
                          background-color: #0c5460;
                          border-color: #0c5460;
                        }
                      `}
                      action
                      key={t.id}
                      to={t.id}
                      tag={props => (
                        <Link
                          getProps={isPartiallyActive(props.className)}
                          {...props}
                        />
                      )}>
                      {`${t.lastName}, ${t.firstName}`}
                    </ListGroupItem>
                  )
                })}
              </ListGroup>
            </div>
            <div css={{ gridArea: 'lease', overflowY: 'scroll' }}>
              {children}
            </div>
          </div>
        )
      }}
    />
  )
}

const Units: SFC<RouteProps & { propertyId?: string }> = unitProps => {
  const propertyId = unitProps.propertyId!
  const activeCompany = auth.activeCompany
  return (
    <UnitsCollection
      key={propertyId}
      path={`companies/${activeCompany}/properties/${propertyId}/units`}
      transform={units =>
        units.sort((a, b) => collator.compare(a.address, b.address))
      }
      render={(units, hasLoaded) => {
        return (
          <>
            <Component
              initialState={{ modal: false }}
              toggleCallback={({ modal }: any) => ({
                modal: !modal,
              })}
              render={({ setState, props: { toggleCallback }, state }: any) => (
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
                    activeCompany={activeCompany}
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
                flex: 1;
                overflow-y: scroll;
                .list-group-item.list-group-item-action.active {
                  color: #fff;
                  background-color: #155724;
                  border-color: #155724;
                }
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
                            getProps={isPartiallyActive(props.className)}
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
                      click <code>New</code> to create a new unit
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
}

const Properties: SFC<RouteProps> = ({ children }) => {
  const { activeCompany } = auth
  return (
    <PropertiesCollection
      path={`companies/${activeCompany}/properties`}
      orderBy={{ field: 'name', direction: 'asc' }}
      render={properties => {
        return (
          <div
            css={{
              display: 'grid',
              height: 'calc(100vh - 56px)',
              gridTemplateAreas: `
                "props lease"
                "units lease"
              ;`,
              gridTemplateColumns: 'minmax(0, 250px) 1fr',
              gridTemplateRows: 'repeat(2, calc((100vh - 56px)/2))',
            }}>
            <Router
              css={{
                gridArea: 'lease',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'scroll',
              }}>
              <PropertyDetail path=":propertyId">
                <LeaseView path="/" />
                <UnitDetail path="units/:unitId">
                  <LeaseView path="/" />
                </UnitDetail>
              </PropertyDetail>
            </Router>
            <div
              css={{
                gridArea: 'props',
                display: 'flex',
                flexDirection: 'column',
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
                  flex: 1;
                  overflow-y: scroll;
                  .list-group-item.list-group-item-action.active {
                    color: #fff;
                    background-color: #0c5460;
                    border-color: #0c5460;
                  }
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
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: '1em',
              }}>
              <Units path=":propertyId/*" />
            </Router>
          </div>
        )
      }}
    />
  )
}

export default Dashboard
