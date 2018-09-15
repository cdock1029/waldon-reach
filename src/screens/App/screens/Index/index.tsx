import React, { Fragment } from 'react'
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
import qs from 'query-string'
import { authCollection } from '../../../../shared/firebase'
import { Observable, combineLatest, BehaviorSubject } from 'rxjs'
import {
  switchMap,
  map,
  filter,
  distinctUntilChanged,
  startWith,
} from 'rxjs/operators'
import { TestRx } from '../../shared/components/FirestoreData'

interface IndexProps extends RouteProps {
  location: {
    search: string
    pathname: string
  }
}
class Index extends React.Component<IndexProps> {
  propertyIdSubject: BehaviorSubject<string>
  data$: Observable<[Property[], Unit[], Tenant[]]>
  constructor(props: IndexProps) {
    super(props)
    const { p } = qs.parse(props.location.search)
    this.propertyIdSubject = new BehaviorSubject<string>(p)
    const properties$ = authCollection<Property>('properties', {
      orderBy: ['name'],
    })
    const units$ = this.propertyIdSubject.pipe(
      filter(Boolean),
      distinctUntilChanged(),
      switchMap(id =>
        authCollection<Unit>(`properties/${id}/units`).pipe(
          map(units => sortUnits(units)),
        ),
      ),
      startWith([]),
    )
    const tenants$ = authCollection<Tenant>('tenants', {
      orderBy: ['lastName'],
    })
    this.data$ = combineLatest(properties$, units$, tenants$)
  }
  componentDidUpdate(prevProps: IndexProps) {
    const { p: prevP } = qs.parse(prevProps.location.search)
    const { p } = qs.parse(this.props.location.search)
    if (p !== prevP) {
      this.propertyIdSubject.next(p)
    }
  }
  render() {
    const { p: propertyId, u: unitId, t: tenantId } = qs.parse(
      this.props.location.search,
    )
    return (
      <TestRxAll observable={this.data$}>
        {(data, hasLoaded) => {
          const [properties, units, tenants] = data ? data : [[], [], []]
          const hasPropertiesLoaded = hasLoaded
          const hasUnitsLoaded = hasLoaded
          const hasTenantsLoaded = hasLoaded
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
                    <NewUnitForm propertyId={propertyId} />
                  </ListHeader>

                  <ListGroup flush className={unitsListWrapStyles}>
                    {units.length ? (
                      units.map(u => {
                        return (
                          <ListGroupItem
                            action
                            key={u.id}
                            to={`${location.pathname}?p=${propertyId}&u=${
                              u.id
                            }`}
                            active={unitId === u.id}
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
                    {/* <TestRxTenant
                      observable={}
                    >{(tenants, hasLoaded) => (
                    )}</TestRxTenant> */}
                    {tenants.length ? (
                      tenants.map(t => {
                        return (
                          <ListGroupItem
                            action
                            key={t.id}
                            to={`${location.pathname}?t=${t.id}`}
                            active={tenantId === t.id}
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
      </TestRxAll>
    )
  }
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

class TestRxAll extends TestRx<[Property[], Unit[], Tenant[]]> {}

export default Index
