import React, { SFC, Fragment } from 'react'
import { Collection } from '../../shared/components/FirestoreData'
import { Link } from '@reach/router'
import { ListHeader } from './components/ListHeader'
import { ListGroup, ListGroupItem, Card, CardText, CardTitle } from 'reactstrap'
import { sortUnits } from '../../../shared/utils'
import { NewPropertyForm } from './components/NewPropertyForm'
import NewUnitForm from './components/NewUnitForm'
import NewTenantForm from './components/NewTenantForm'
import LeaseContainer from './components/LeaseContainer'
import { Dashboard } from './components/Dashboard'
import { css } from 'react-emotion'
import { adopt } from 'react-adopt'
import qs from 'query-string'

class CollectionProperty extends Collection<Property> {}
class CollectionUnit extends Collection<Unit> {}
class CollectionTenant extends Collection<Tenant> {}

const PropertiesCollection: SFC<{
  children(data: Property[], hasLoaded: boolean): any
}> = ({ children }) => (
  <CollectionProperty
    key="properties"
    authPath="properties"
    orderBy={{ field: 'name', direction: 'asc' }}
    children={children}
  />
)

const UnitsCollection: SFC<{
  propertyId: string
  children(data: Unit[], hasLoaded: boolean): any
}> = ({ children, propertyId }) => {
  return (
    <CollectionUnit
      key="units"
      authPath={`properties/${propertyId}/units`}
      transform={sortUnits}
      children={children}
    />
  )
}
const TenantsCollection: SFC<{
  children(data: Tenant[], hasLoaded: boolean): any
}> = ({ children }) => (
  <CollectionTenant
    key="tenants"
    authPath="tenants"
    orderBy={{ field: 'lastName', direction: 'asc' }}
    children={children}
  />
)
interface CombinedRenderProps {
  p: { properties: Property[]; hasPropertiesLoaded: boolean }
  u: { units: Unit[]; hasUnitsLoaded: boolean }
  t: { tenants: Tenant[]; hasTenantsLoaded: boolean }
}
interface ComposedProps {
  propertyId?: string
}

// TODO: u must be last as it accepts extra params. check bug with adopt builder.. unmounts
// components if they are added after 'u'
const ComposedData = adopt<CombinedRenderProps, ComposedProps>({
  t: ({ render }: any) => (
    <TenantsCollection>
      {(tenants, hasLoaded) => render({ tenants, hasTenantsLoaded: hasLoaded })}
    </TenantsCollection>
  ),
  p: ({ render }: any) => (
    <PropertiesCollection>
      {(properties, hasLoaded) =>
        render({ properties, hasPropertiesLoaded: hasLoaded })
      }
    </PropertiesCollection>
  ),
  u: ({ render, propertyId }: any) => {
    return propertyId ? (
      <UnitsCollection propertyId={propertyId}>
        {(units, hasLoaded) => render({ units, hasUnitsLoaded: hasLoaded })}
      </UnitsCollection>
    ) : (
      render({ units: [], hasLoaded: true })
    )
  },
})

const Index: SFC<RouteProps> = ({ location }: any) => {
  const { p: propertyId, u: unitId, t: tenantId } = qs.parse(location.search)
  const currentRouteParams = { propertyId, unitId, tenantId }
  return (
    <ComposedData propertyId={propertyId}>
      {({
        p: { properties, hasPropertiesLoaded },
        u: { units, hasUnitsLoaded },
        t: { tenants, hasTenantsLoaded },
      }) => {
        return (
          <Dashboard
            leaseContainer={<LeaseContainer {...currentRouteParams} />}
            sidebarItems={[
              <Fragment key="leftSidebarTop">
                <ListHeader label="Properties">
                  <NewPropertyForm />
                </ListHeader>
                <ListGroup
                  key="sidebarTopListGroup"
                  className={propertiesListWrapStyles}
                  flush>
                  {properties.length ? (
                    properties.map(p => {
                      return (
                        <ListGroupItem
                          action
                          key={p.id}
                          to={`${location.pathname}?p=${p.id}`}
                          active={p.id === propertyId}
                          tag={props => <Link {...props} />}>
                          {p.name}
                        </ListGroupItem>
                      )
                    })
                  ) : hasPropertiesLoaded ? (
                    <NoItems label="properties" />
                  ) : null}
                </ListGroup>
              </Fragment>,

              <Fragment key="leftSidebarBottom-units">
                <ListHeader label="Units" disabled={!propertyId}>
                  <NewUnitForm propertyId={currentRouteParams.propertyId} />
                </ListHeader>

                <ListGroup flush className={unitsListWrapStyles}>
                  {units.length ? (
                    units.map(u => {
                      return (
                        <ListGroupItem
                          action
                          key={u.id}
                          to={`${location.pathname}?p=${
                            currentRouteParams.propertyId
                          }&u=${u.id}`}
                          active={currentRouteParams.unitId === u.id}
                          tag={props => <Link {...props} />}>
                          {u.label}
                        </ListGroupItem>
                      )
                    })
                  ) : hasUnitsLoaded ? (
                    <NoItems label="units" />
                  ) : null}
                </ListGroup>
              </Fragment>,
            ]}
            rightSidebarItems={[
              <Fragment key="rightSidebar">
                <ListHeader label="Tenants">
                  <NewTenantForm />
                </ListHeader>
                <ListGroup
                  key="sidebarTopListGroup"
                  className={tenantListWrapStyles}
                  flush>
                  {tenants.length ? (
                    tenants.map(t => {
                      return (
                        <ListGroupItem
                          action
                          key={t.id}
                          to={`${location.pathname}?t=${t.id}`}
                          active={currentRouteParams.tenantId === t.id}
                          tag={p => <Link {...p} />}>
                          {`${t.lastName}, ${t.firstName}`}
                        </ListGroupItem>
                      )
                    })
                  ) : hasTenantsLoaded ? (
                    <NoItems label="tenants" />
                  ) : null}
                </ListGroup>
              </Fragment>,
            ]}
          />
        )
      }}
    </ComposedData>
  )
}

const NoItems: React.SFC<{ label: string }> = ({ label }) => (
  <div
    css={{
      padding: '1em',
      '.new': { display: 'inline-block', color: `var(--color-${label})` },
    }}>
    <Card body>
      <CardTitle>No {label}</CardTitle>
      <CardText>
        click <span className="new">New</span> to add a new one
      </CardText>
    </Card>
  </div>
)

const propertiesListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
  .list-group-item.list-group-item-action.active {
    color: #fff;
    background-color: var(--color-properties);
    border-color: var(--color-properties);
  }
`
const unitsListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
  .list-group-item.list-group-item-action.active {
    color: #fff;
    background-color: var(--color-units);
    border-color: var(--color-units);
  }
`
const tenantListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
  .list-group-item.list-group-item-action.active {
    color: #fff;
    background-color: var(--primary);
    border-color: var(--primary);
  }
`

export default Index
