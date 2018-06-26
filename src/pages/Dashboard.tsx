import React, { SFC } from 'react'
import { Collection } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
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
import LeaseContainer from '@comp/LeaseContainer'
import { Document } from '@comp/FirestoreData'
import { auth } from '@lib/firebase'
import { css, cx } from 'react-emotion'

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
        <LeaseContainer path="/" />
      </TenantDetail>
    </Tenants>
  </Router>
)
const DashIndex: SFC<RouteProps> = () => {
  const user = auth.currentUser!
  const name = user.displayName ? user.displayName : user.email
  return (
    <div className={css({ padding: '1em' })}>
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
          <Card className={css({ gridArea: 'property', padding: '1em' })}>
            <CardBody>
              <CardText>Property</CardText>
              <CardTitle>{property && property.name}</CardTitle>
            </CardBody>
          </Card>
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
            <div className={css({ padding: '1em' })}>
              <Card>
                <CardBody>
                  <CardText>Unit</CardText>
                  <CardSubtitle>{unit.address}</CardSubtitle>
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
          <div className={css({ padding: '1em' })}>
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
          <div className={tenantsGridStyles}>
            <div className={tenantsListSectionStyles}>
              <Component
                initialState={{ modal: false }}
                toggleCallback={({ modal }: any) => ({ modal: !modal })}
                render={({ setState, props: { toggleCallback } }: any) => (
                  <>
                    <h6 className={listHeaderStyles}>
                      Tenants{' '}
                      <Badge
                        color="secondary"
                        onClick={() => setState(toggleCallback)}>
                        New
                      </Badge>
                    </h6>
                  </>
                )}
              />
              <ListGroup className={tenantListWrapStyles} flush>
                {tenants.map(t => {
                  return (
                    <ListGroupItem
                      className={css`
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
            <div className={leaseSectionStyles}>{children}</div>
          </div>
        )
      }}
    />
  )
}
const tenantsGridStyles = css({
  display: 'grid',
  gridTemplateAreas: `
    "tenants lease"
  ;`,
  gridTemplateColumns: 'minmax(0, 250px) 1fr',
  gridTemplateRows: 'calc(100vh - var(--header-height))',
})
const tenantsListSectionStyles = css({
  gridArea: 'tenants',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
})
const tenantListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
`

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
                <h6 className={listHeaderStyles}>
                  Units{' '}
                  <Badge
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
            <ListGroup flush className={unitsListWrapStyles}>
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
                <div className={css({ padding: '1em' })}>
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

const Properties: SFC<RouteProps> = () => {
  const { activeCompany } = auth
  return (
    <PropertiesCollection
      path={`companies/${activeCompany}/properties`}
      orderBy={{ field: 'name', direction: 'asc' }}
      render={properties => {
        return (
          <div className={propertiesGridStyles}>
            <Router className={leaseSectionStyles}>
              <LeaseContainer path="/*" />
              <LeaseContainer path="/:propertyId/*" />
              <LeaseContainer path="/:propertyId/units/:unitId/*" />
              {/* <PropertyDetail path=":propertyId">
                <UnitDetail path="units/:unitId">
                  <LeaseContainer path="/" />
                </UnitDetail>
              </PropertyDetail> */}
            </Router>
            <div className={propertiesListSectionStyles}>
              <Component
                initialState={{ modal: false }}
                toggleCallback={({ modal }: any) => ({ modal: !modal })}
                render={({ setState, props: { toggleCallback } }: any) => (
                  <>
                    <h6 className={listHeaderStyles}>
                      Properties{' '}
                      <Badge
                        color="secondary"
                        onClick={() => setState(toggleCallback)}>
                        New
                      </Badge>
                    </h6>
                  </>
                )}
              />
              <ListGroup className={propertiesListWrapStyles} flush>
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
            <Router className={unitsListSectionStyles}>
              <Units path=":propertyId/*" />
            </Router>
          </div>
        )
      }}
    />
  )
}
const propertiesGridStyles = css({
  display: 'grid',
  height: 'calc(100vh - var(--header-height))',
  gridTemplateAreas: `
    "props lease"
    "units lease"
  ;`,
  gridTemplateColumns: 'minmax(0, 250px) 1fr',
  gridTemplateRows: `
    minmax(calc(2 * (100vh - var(--header-height))/5), 1fr)
    minmax(calc(3 * (100vh - var(--header-height))/5), 1fr)
  `,
  label: 'PropertiesParentGrid',
})

const unitsListSectionStyles = css({
  gridArea: 'units',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '1em',
  label: 'UnitsGridArea',
})
const propertiesListSectionStyles = css({
  gridArea: 'props',
  display: 'flex',
  flexDirection: 'column',
  borderBottom: '1px solid rgba(0,0,0,0.1)',
  label: 'PropsGridArea',
})

const leaseSectionStyles = css`
  grid-area: lease;
  display: grid;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  label: LeaseGridArea;
`

const propertiesListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
  .list-group-item.list-group-item-action.active {
    color: #fff;
    background-color: #0c5460;
    border-color: #0c5460;
  }
`
const unitsListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
  .list-group-item.list-group-item-action.active {
    color: #fff;
    background-color: #155724;
    border-color: #155724;
  }
`

const listHeaderStyles = cx(
  'bg-light',
  css`
    padding: 0.5em;
    margin: 0;
    display: flex;
    justify-content: space-between;
    .badge {
      cursor: pointer;
    }
  `,
)

export default Dashboard
