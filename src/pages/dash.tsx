import React, { SFC, Fragment } from 'react'
import { Collection } from '../components/FirestoreData'
import { NavLink as Link } from 'react-router-dom'
import { ListHeader } from '../components/ListHeader'
import {
  ListGroup,
  ListGroupItem,
  Card,
  CardText,
  CardTitle,
  Badge,
} from 'reactstrap'
import { collator } from '../lib/index'
import { NewPropertyForm } from '../components/NewPropertyForm'
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
    <TenantsCollection
      render={(tenants, hasLoaded) =>
        render({ tenants, hasTenantsLoaded: hasLoaded })
      }
    />
  ),
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
})

const Dash: SFC<RouteProps> = ({ match, location }: any) => {
  console.log({ match, location })
  const path = match.path
  const { p: propertyId, u: unitId, t: tenantId } = qs.parse(location.search)
  const currentRouteParams = { propertyId, unitId, tenantId }
  return (
    <ComposedData propertyId={propertyId}>
      {({
        p: { properties, hasPropertiesLoaded },
        u: { units, hasUnitsLoaded },
        t: { tenants, hasTenantsLoaded },
      }) => {
        console.log({ properties, units, tenants })
        return (
          <Dashboard
            leaseContainer={<LeaseContainer {...currentRouteParams} />}
            sidebarItems={[
              <Fragment key="sidebarTopList">
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
                          to={`${path}?p=${p.id}`}
                          active={p.id === propertyId}
                          tag={Link}>
                          {p.name}
                        </ListGroupItem>
                      )
                    })
                  ) : hasPropertiesLoaded ? (
                    <NoItems label="properties" />
                  ) : null}
                </ListGroup>
              </Fragment>,

              <Fragment>
                <ListHeader label="units" disabled={!propertyId}>
                  <NewUnitForm propertyId={currentRouteParams.propertyId} />
                </ListHeader>

                <ListGroup flush className={unitsListWrapStyles}>
                  {units.length ? (
                    units.map(u => {
                      return (
                        <ListGroupItem
                          action
                          key={u.id}
                          to={`${path}?p=${currentRouteParams.propertyId}&u=${
                            u.id
                          }`}
                          active={currentRouteParams.unitId === u.id}
                          tag={Link}>
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
              <Fragment>
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
                          to={`${path}?t=${t.id}`}
                          active={currentRouteParams.tenantId === t.id}
                          tag={Link}>
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
      h6: { display: 'inline-block', color: `var(--color-${label})` },
    }}>
    <Card body>
      <CardTitle>No {label}</CardTitle>
      <CardText>
        click <h6>New</h6> to add a new one
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

export default Dash
