import React, { SFC, Fragment } from 'react'
import {
  CardBody,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardTitle,
  CardText,
  CardSubtitle,
  Badge,
} from 'reactstrap'
import styled, { css } from 'react-emotion'
import ReactTable from 'react-table'
import { format } from 'date-fns'
import { Document, Collection } from '../components/FirestoreData'
import { CurrencyAddDecimals } from '../lib/index'
import { NavLink as Link } from 'react-router-dom'
import { ListHeader } from '../components/ListHeader'
import NewTenantForm from './NewTenantForm'

type CollectionReference = firebase.firestore.CollectionReference

class LeaseCollection extends Collection<Lease> {}

const enum LeaseActiveFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface LeaseContainerProps extends RouteProps {
  propertyId?: string
  unitId?: string
  tenantId?: string
}
interface LeaseContainerState {
  activeTab: LeaseActiveFilter
}

class LeaseContainer extends React.Component<
  LeaseContainerProps,
  LeaseContainerState
> {
  leasesRef: CollectionReference
  state = {
    activeTab: LeaseActiveFilter.ACTIVE,
  }
  toggleTab(tab: LeaseActiveFilter) {
    this.setState(
      ({ activeTab }) => (tab !== activeTab ? { activeTab: tab } : null),
    )
  }

  render() {
    // console.log('render LeaseContainer')
    const { propertyId, unitId, tenantId } = this.props
    const { activeTab } = this.state
    const where: Array<WhereParam> = [['status', '==', activeTab]]
    if (propertyId) {
      where.push([`properties.${propertyId}.exists`, '==', true])
      if (unitId) {
        where.push([`units.${unitId}.exists`, '==', true])
      }
    } else if (tenantId) where.push([`tenants.${tenantId}.exists`, '==', true])
    return (
      <Fragment>
        <div className={leaseHeaderStyles}>
          {propertyId && <PropertyDetail propertyId={propertyId} />}
          {unitId && <UnitDetail propertyId={propertyId} unitId={unitId} />}
          {tenantId && <TenantDetail tenantId={tenantId} />}
        </div>
        <div className={leaseContainerStyles}>
          <ListHeader label="Leases">
            <NewTenantForm />
          </ListHeader>
          <Nav tabs className="bg-light">
            <NavItem>
              <NavLink
                active={this.state.activeTab === LeaseActiveFilter.ACTIVE}
                className={tabNavLinkStyles}
                onClick={() => this.toggleTab(LeaseActiveFilter.ACTIVE)}>
                Active
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={this.state.activeTab === LeaseActiveFilter.INACTIVE}
                className={tabNavLinkStyles}
                onClick={() => this.toggleTab(LeaseActiveFilter.INACTIVE)}>
                Inactive
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent
            className={tabContentStyles}
            activeTab={this.state.activeTab}>
            <LeaseCollection
              authPath="leases"
              where={where}
              render={(leases, hasLoaded) => {
                // console.log({ leases, hasLoaded })
                const tab = this.state.activeTab
                return (
                  <Fragment>
                    {tab === LeaseActiveFilter.ACTIVE && (
                      <TabPane tabId={LeaseActiveFilter.ACTIVE}>
                        <LeasesView
                          key="active"
                          tab="active"
                          /* leases={hasLoaded ? leases : []} */
                          leases={leases}
                          showProperties={!Boolean(propertyId)}
                          showUnits={!Boolean(unitId)}
                          loading={!hasLoaded}
                        />
                      </TabPane>
                    )}
                    {tab === LeaseActiveFilter.INACTIVE && (
                      <TabPane tabId={LeaseActiveFilter.INACTIVE}>
                        <LeasesView
                          key="inactive"
                          tab="inactive"
                          /* leases={hasLoaded ? leases : []}*/
                          leases={leases}
                          showProperties={!Boolean(propertyId)}
                          showUnits={!Boolean(unitId)}
                          loading={!hasLoaded}
                        />
                      </TabPane>
                    )}
                  </Fragment>
                )
              }}
            />
          </TabContent>
        </div>
      </Fragment>
    )
  }
}

interface LeasesProps {
  leases: Lease[]
  loading?: boolean
  showProperties: boolean
  showUnits: boolean
}
const LeasesView: SFC<LeasesProps & { tab?: string }> = ({
  leases,
  showProperties,
  showUnits,
  loading = false,
  tab,
}) => {
  const columns = [
    {
      Header: 'Tenants',
      id: 'tenants',
      accessor: (l: Lease) => (
        <StringStack>
          {Object.entries(l.tenants)
            .map<string>(([id, { exists, name }]) => name)
            .join('\n')}
        </StringStack>
      ),
    },
    {
      Header: 'Rent',
      id: 'rent',
      accessor: (l: Lease) => {
        return CurrencyAddDecimals(l.rent)
      },
      aggregate: (vals: any[]) => vals[0],
    },
    {
      Header: 'Balance',
      id: 'balance',
      accessor: (l: Lease) => CurrencyAddDecimals(l.balance),
    },
    {
      Header: 'Link',
      id: 'link',
      accessor: (l: Lease) => l.id,
      Cell: (row: any) => <Link to={`/lease/${row.value}`}>#</Link>,
    },
  ]
  if (showUnits) {
    columns.splice(1, 0, {
      Header: 'Units',
      id: 'units',
      aggregate: (vals: any[]) => vals[0],
      accessor: (l: Lease) =>
        Object.entries(l.units)
          .map<string>(([id, { exists, address }]) => address)
          .join(' | '),
    })
  }
  if (showProperties) {
    columns.splice(1, 0, {
      Header: 'Properties',
      id: 'properties',
      aggregate: (vals: any[]) => vals[0],
      accessor: (l: Lease) =>
        Object.entries(l.properties)
          .map<string>(([id, { exists, name }]) => name)
          .join(' | '),
    })
  }
  // console.log('render Leases View', { tab })
  // TODO: look into why loading "fade animation" only seems to run in certain situations.
  // ... adds a flicker sometimes instead of smooth transition.
  return (
    <div key="react-table" className="lease-table">
      <ReactTable
        loading={loading}
        data={leases}
        columns={columns}
        defaultPageSize={15}
        pageSizeOptions={[10, 15, 50, 100]}
        className="-striped -highlight"
        SubComponent={({ original: lease }) => {
          return <TransactionsSubComponent lease={lease} />
        }}
      />
    </div>
  )
}

class TransactionsSubComponent extends React.Component<{
  lease: Lease
}> {
  render() {
    const { lease } = this.props
    return (
      <Collection<Transaction>
        authPath={`leases/${lease.id}/transactions`}
        orderBy={{ field: 'date', direction: 'desc' }}
        render={(transactions, hasLoaded) => (
          <div
            css={{
              padding: '2em',
              /*'.transactions-header': {
                border: '1px solid rgba(0,0,0,.1)',
                borderBottom: 'none',
              },*/
            }}>
            <ListHeader label="transactions" className="transactions-header">
              <NewTenantForm />
            </ListHeader>
            <ReactTable
              className={transactionTableStyle}
              loading={!hasLoaded}
              data={transactions}
              defaultPageSize={5}
              columns={[
                {
                  Header: 'type',
                  accessor: 'type',
                  Cell: ({
                    value,
                    original: { type },
                  }: {
                    original: Transaction
                    value: number
                  }) => (
                    <Badge
                      pill
                      color={type === 'CHARGE' ? 'secondary' : 'success'}>
                      {value}
                    </Badge>
                  ),
                },
                {
                  Header: 'amount',
                  accessor: 'amount',
                  Cell: ({
                    value,
                    original: { type },
                  }: {
                    original: Transaction
                    value: number
                  }) => {
                    return (
                      <span
                        className={
                          type === 'PAYMENT' ? 'text-success' : undefined
                        }>
                        {value}
                      </span>
                    )
                  },
                },
                {
                  Header: 'date',
                  id: 'date',
                  accessor: (t: Transaction) =>
                    format(t.date.toDate(), 'EEE d MMM YYYY'),
                },
              ]}
            />
          </div>
        )}
      />
    )
  }
}

class PropertyDoc extends Document<Property> {}
class UnitDoc extends Document<Unit> {}

interface PropertyDetailProps {
  propertyId?: string
}
const PropertyDetail: SFC<PropertyDetailProps & RouteProps> = ({
  propertyId,
  children,
}) => {
  return (
    <Fragment>
      <PropertyDoc
        authPath={`properties/${propertyId}`}
        render={property => (
          <Card>
            <CardBody>
              <CardText className="text-secondary">Property</CardText>
              <CardTitle className="color-properties">
                {property && property.name}
              </CardTitle>
            </CardBody>
          </Card>
        )}
      />
      {children}
    </Fragment>
  )
}

interface UnitDetailProps {
  propertyId?: string
  unitId?: string
}
const UnitDetail: SFC<UnitDetailProps & RouteProps> = ({
  propertyId,
  unitId,
}) => {
  return (
    <UnitDoc
      authPath={`properties/${propertyId}/units/${unitId}`}
      render={unit =>
        unit ? (
          <Card>
            <CardBody>
              <CardText className="text-secondary">Unit</CardText>
              <CardTitle className="color-units">{unit.label}</CardTitle>
            </CardBody>
          </Card>
        ) : null
      }
    />
  )
}

class TenantDoc extends Document<Tenant> {}
const TenantDetail: SFC<RouteProps & { tenantId: string }> = ({ tenantId }) => {
  return (
    <TenantDoc
      authPath={`tenants/${tenantId}`}
      render={tenant => (
        <Card>
          <CardBody>
            <CardText className="text-secondary">Tenant</CardText>
            {tenant && (
              <Fragment>
                <CardTitle className="color-tenants">
                  {`${tenant.firstName} ${tenant.lastName}`}
                </CardTitle>
                {tenant.email && (
                  <CardSubtitle className="text-muted">
                    {tenant.email}
                  </CardSubtitle>
                )}
              </Fragment>
            )}
          </CardBody>
        </Card>
        // <Alert className={`${detailCardStyles} tenant-tile`}>
        //   <h4 className="alert-heading">Tenant</h4>
        //   {tenant && (
        //     <Fragment>
        //       <p>{`${tenant.firstName} ${tenant.lastName}`}</p>
        //       <p className="mb-0">{tenant.email && tenant.email}</p>
        //     </Fragment>
        //   )}
        // </Alert>
      )}
    />
  )
}

const StringStack = styled('pre')`
  margin: 0;
  font-family: var(--font-family-sans-serif);
`
const leaseHeaderStyles = css`
  grid-area: leasesHeader;
  /* account for tenant deatils, name email etc.. */
  min-height: 164px;
  display: grid;
  padding: 1em;
  grid-gap: 1em;
  grid-template-columns: 1fr 1fr;
`
const leaseContainerStyles = css`
  grid-area: leasesTable;
  display: block;
  padding: 0 1em;
  .lease-item {
    border: 1px solid #000;
    padding: 1em;
  }
  .lease-table {
    /* padding-left: 0; */
  }
`
const tabContentStyles = css`
  padding-top: 1em;
  background-color: #fff;
`
const tabNavLinkStyles = css`
  cursor: pointer;
`
const transactionTableStyle = css`
  background-color: #fffcf8;
`

export default LeaseContainer
