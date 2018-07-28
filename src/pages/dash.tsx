import React, { SFC, Fragment } from 'react'
import { Collection, CollectionProps } from '../components/FirestoreData'
import { Route, NavLink as Link, Switch } from 'react-router-dom'
import { ListHeader } from '../components/ListHeader'
import {
  ListGroup,
  ListGroupItem,
  Card,
  CardText,
  CardTitle,
  Modal,
} from 'reactstrap'
import { collator } from '../lib/index'
import NewUnitForm from '../components/NewUnitForm'
import NewTenantForm from '../components/NewTenantForm'
import LeaseContainer from '../components/LeaseContainer'
import { Dashboard } from '../components/dashboard'
import { css } from 'react-emotion'
import { adopt } from 'react-adopt'
import qs from 'query-string'

const PropertiesCollection: SFC<{
  render(data: Property[], hasLoaded: boolean): any
}> = ({ render }) => (
  <Collection<Property>
    key="properties"
    authPath="properties"
    orderBy={{ field: 'name', direction: 'asc' }}
    render={render}
  />
)

const UnitsCollection: SFC<{
  render(data: Unit[], hasLoaded: boolean): any
  propertyId: string
}> = ({ render, propertyId }) => {
  // console.log('propertyId inside UnitsCollection:', propertyId)
  return (
    <Collection<Unit>
      key="units"
      authPath={`properties/${propertyId}/units`}
      transform={uns => uns.sort((a, b) => collator.compare(a.label, b.label))}
      render={render}
    />
  )
}
const TenantsCollection: SFC<{
  render(data: Tenant[], hasLoaded: boolean): any
}> = ({ render }) => (
  <Collection<Tenant>
    key="tenants"
    authPath="tenants"
    orderBy={{ field: 'lastName', direction: 'asc' }}
    render={render}
  />
)

const Units: SFC<
  RouteProps & {
    units: Unit[]
    hasUnitsLoaded: boolean
    currentRouteParams: {
      propertyId: string
      unitId?: string
      tenantId?: string
    }
  }
> = ({ units, hasUnitsLoaded, currentRouteParams }) => {
  return (
    <React.Fragment>
      <ListHeader label="Units">
        {(modal, toggle) => (
          <NewUnitForm
            propertyId={currentRouteParams.propertyId}
            isModalOpen={modal}
            toggleModal={toggle}
          />
        )}
      </ListHeader>

      <ListGroup flush className={unitsListWrapStyles}>
        {units.map(u => {
          return (
            <ListGroupItem
              action
              key={u.id}
              to={`/dash?p=${currentRouteParams.propertyId}&u=${u.id}`}
              active={currentRouteParams.unitId === u.id}
              tag={Link}>
              {u.label}
            </ListGroupItem>
          )
        })}
        {hasUnitsLoaded && !units.length ? (
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
    </React.Fragment>
  )
}

const Tenants = ({
  tenants,
  currentRouteParams,
}: {
  tenants: Tenant[]
  currentRouteParams: { propertyId: string; unitId?: string; tenantId?: string }
}) => {
  return (
    <Fragment>
      <ListHeader label="Tenants">
        {(modal, toggle) => (
          <NewTenantForm isModalOpen={modal} toggleModal={toggle} />
        )}
      </ListHeader>
      <ListGroup
        key="sidebarTopListGroup"
        className={tenantListWrapStyles}
        flush>
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
              to={`/dash?t=${t.id}`}
              active={currentRouteParams.tenantId === t.id}
              tag={Link}>
              {`${t.lastName}, ${t.firstName}`}
            </ListGroupItem>
          )
        })}
      </ListGroup>
    </Fragment>
  )
}

interface CombinedRenderProps {
  p: { properties: Property[]; hasPropertiesLoaded: boolean }
  u: { units: Unit[]; hasUnitsLoaded: boolean }
  t: { tenants: Tenant[]; hasTenantsLoaded: boolean }
}
interface ComposedProps {
  propertyId?: string
}
const ComposedData = adopt<CombinedRenderProps, ComposedProps>({
  p: ({ render }: any) => (
    <PropertiesCollection
      render={(properties, hasLoaded) =>
        render({ properties, hasPropertiesLoaded: hasLoaded })
      }
    />
  ),
  u: ({ render, propertyId }: any) => {
    // console.log('propertyId inside Composed data/u:', { propertyId })
    return propertyId ? (
      <UnitsCollection
        propertyId={propertyId}
        render={(units, hasLoaded) =>
          render({ units, hasUnitsLoaded: hasLoaded })
        }
      />
    ) : (
      render({ units: [], hasLoaded: true })
    )
  },
  t: ({ render }: any) => (
    <TenantsCollection
      render={(tenants, hasLoaded) =>
        render({ tenants, hasTenantsLoaded: hasLoaded })
      }
    />
  ),
})

const Dash: SFC<RouteProps> = ({ match, location }: any) => {
  console.log({ match, location })
  const { p: propertyId, u: unitId, t: tenantId } = qs.parse(location.search)
  const currentRouteParams = { propertyId, unitId, tenantId }
  return (
    <ComposedData propertyId={propertyId}>
      {({
        p: { properties, hasPropertiesLoaded },
        u: { units, hasUnitsLoaded },
        t: { tenants, hasTenantsLoaded },
      }) => {
        // console.table(properties)
        // console.log({ units, hasUnitsLoaded })
        // return (
        //   <div>
        //     <ul>{properties.map(p => <li key={p.id}>{p.name}</li>)}</ul>
        //     <ul>{units.map(u => <li key={u.id}>{u.label}</li>)}</ul>
        //   </div>
        // )

        return (
          <Dashboard
            leaseContainer={
              <LeaseContainer {...currentRouteParams} />
              // <Switch>
              //   <Route component={LeaseContainer} path="/properties" exact />
              //   <Route
              //     render={({
              //       match: {
              //         params: { propertyId },
              //       },
              //     }: any) => <LeaseContainer propertyId={propertyId} />}
              //     path="/properties/:propertyId"
              //     exact
              //   />
              //   <Route
              //     render={({
              //       match: {
              //         params: { propertyId, unitId },
              //       },
              //     }) => (
              //       <LeaseContainer propertyId={propertyId} unitId={unitId} />
              //     )}
              //     path="/properties/:propertyId/units/:unitId"
              //   />
              // </Switch>
            }
            sidebarItems={[
              <React.Fragment key="sidebarTopList">
                <ListHeader label="Properties">
                  {(modal, toggle) => (
                    <Modal isModalOpen={modal} toggle={toggle}>
                      Hello world
                    </Modal>
                  )}
                </ListHeader>
                <ListGroup
                  key="sidebarTopListGroup"
                  className={propertiesListWrapStyles}
                  flush>
                  {properties.map(p => {
                    return (
                      <ListGroupItem
                        action
                        key={p.id}
                        to={`/dash?p=${p.id}`}
                        active={p.id === propertyId}
                        tag={Link}>
                        {p.name}
                      </ListGroupItem>
                    )
                  })}
                </ListGroup>
              </React.Fragment>,
              <Units
                currentRouteParams={currentRouteParams}
                hasUnitsLoaded={hasUnitsLoaded}
                units={units}
              />,
            ]}
            rightSidebarItems={[
              <Tenants
                tenants={tenants}
                currentRouteParams={currentRouteParams}
              />,
            ]}
          />
        )
      }}
    </ComposedData>
  )
}

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
const tenantListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
`

export default Dash
