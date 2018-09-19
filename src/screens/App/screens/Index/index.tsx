import React, { Fragment, SFC } from 'react'
import { Link } from '@reach/router'
import { ListHeader } from './components/ListHeader'
import { ListGroup, ListGroupItem, Card, CardText, CardTitle } from 'reactstrap'
import { NewPropertyForm } from './components/NewPropertyForm'
import NewUnitForm from './components/NewUnitForm'
import NewTenantForm from './components/NewTenantForm'
import LeaseContainer from './components/LeaseContainer'
import { Dashboard } from './components/Dashboard'
import { css } from 'react-emotion'
import qs from 'query-string'
import { streamProps } from 'react-streams'
import { pipe } from 'rxjs'
import { map } from 'rxjs/operators'
import {
  PropertiesList,
  UnitsList,
  TenantsList,
} from './components/EntitiesLists'

interface IndexProps extends RouteProps {
  location: {
    search: string
    pathname: string
  }
}
interface IndexStreamResult {
  p?: string
  u?: string
  t?: string
  pathname: string
}

const IndexStream: any = streamProps(
  pipe(
    map<IndexProps, IndexStreamResult>(({ location }) => {
      const { p, u, t }: any = qs.parse(location.search)
      return {
        p,
        u,
        t,
        pathname: location.pathname,
      }
    }),
  ),
)
const Index: SFC<IndexProps> = ({ location }) => {
  return (
    <IndexStream location={location}>
      {({
        p: propertyId,
        u: unitId,
        t: tenantId,
        pathname,
      }: IndexStreamResult) => {
        return (
          <Dashboard
            leaseContainer={
              <LeaseContainer
                propertyId={propertyId}
                unitId={unitId}
                tenantId={tenantId}
              />
            }
            sidebarItems={[
              <Fragment key="leftSidebarTop">
                <ListHeader label="Properties">
                  <NewPropertyForm />
                </ListHeader>

                <ListGroup
                  key="sidebarTopListGroup"
                  className={propertiesListWrapStyles}
                  flush>
                  <PropertiesList
                    selectedProperty={propertyId}
                    pathname={pathname}>
                    {props =>
                      props.properties.length ? (
                        props.properties.map(p => {
                          return (
                            <ListGroupItem
                              action
                              key={p.id}
                              to={`${props.pathname}?p=${p.id}`}
                              active={p.id === props.selectedProperty}
                              tag={linkProps => <Link {...linkProps} />}>
                              {p.name}
                            </ListGroupItem>
                          )
                        })
                      ) : (
                        <NoItems label="properties" />
                      )
                    }
                  </PropertiesList>
                </ListGroup>
              </Fragment>,

              <Fragment key="leftSidebarBottom-units">
                <ListHeader label="Units" disabled={!propertyId}>
                  <NewUnitForm propertyId={propertyId!} />
                </ListHeader>

                <ListGroup flush className={unitsListWrapStyles}>
                  <UnitsList
                    selectedProperty={propertyId}
                    selectedUnit={unitId}
                    pathname={pathname}>
                    {(props: {
                      units: Unit[]
                      selectedProperty: string
                      selectedUnit: string
                      pathname: string
                    }) =>
                      props.units.length ? (
                        props.units.map(u => {
                          return (
                            <ListGroupItem
                              action
                              key={u.id}
                              to={`${props.pathname}?p=${
                                props.selectedProperty
                              }&u=${u.id}`}
                              active={u.id === props.selectedUnit}
                              tag={lProps => <Link {...lProps} />}>
                              {u.label}
                            </ListGroupItem>
                          )
                        })
                      ) : true ? (
                        <NoItems label="units" />
                      ) : null
                    }
                  </UnitsList>
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
                  <TenantsList selectedTenant={tenantId} pathname={pathname}>
                    {(props: {
                      tenants: Tenant[]
                      selectedTenant: string
                      pathname: string
                    }) =>
                      props.tenants.length ? (
                        props.tenants.map(t => {
                          return (
                            <ListGroupItem
                              action
                              key={t.id}
                              to={`${props.pathname}?t=${t.id}`}
                              active={t.id === props.selectedTenant}
                              tag={lProps => <Link {...lProps} />}>
                              {`${t.lastName}, ${t.firstName}`}
                            </ListGroupItem>
                          )
                        })
                      ) : true ? (
                        <NoItems label="tenants" />
                      ) : null
                    }
                  </TenantsList>
                </ListGroup>
              </Fragment>,
            ]}
          />
        )
      }}
    </IndexStream>
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
