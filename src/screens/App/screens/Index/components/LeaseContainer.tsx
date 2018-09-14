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
  Form,
} from 'reactstrap'
import styled, { css, cx } from 'react-emotion'
import UnstyledReactTable from 'react-table'
import { format } from 'date-fns'
import { Document, Collection } from '../../../shared/components/FirestoreData'
import { ListHeader } from './ListHeader'
import { NewLeaseForm } from './NewLeaseForm'
import { CurrencyCell } from './CurrencyCell'
import { Cell } from './Cell'
import { PaymentForm } from './forms/PaymentForm'
import { ChargeForm } from './forms/ChargeForm'
import { switchMap, map } from 'rxjs/operators'

class LeaseCollection extends Collection<Lease> {}
class CollectionTransaction extends Collection<Transaction> {}

const ReactTable = styled(UnstyledReactTable)`
  font-family: var(--font-family-monospace);
`

const ACTIVE = 'ACTIVE'
const INACTIVE = 'INACTIVE'

type LeaseActiveFilter = typeof ACTIVE | typeof INACTIVE

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
  state: LeaseContainerState = {
    activeTab: ACTIVE,
  }
  toggleTab(tab: LeaseActiveFilter) {
    this.setState(
      ({ activeTab }) => (tab !== activeTab ? { activeTab: tab } : null),
    )
  }

  render() {
    const { propertyId, unitId, tenantId } = this.props
    const { activeTab } = this.state
    const where: WhereTuple[] = [['status', '==', activeTab]]
    if (propertyId) {
      where.push([`properties.${propertyId}.exists`, '==', true])
      if (unitId) {
        where.push([`units.${unitId}.exists`, '==', true])
      }
    } else if (tenantId) {
      where.push([`tenants.${tenantId}.exists`, '==', true])
    }
    return (
      <Fragment>
        <div className={leaseHeaderStyles}>
          {propertyId && <PropertyDetail propertyId={propertyId} />}
          {unitId && <UnitDetail propertyId={propertyId} unitId={unitId} />}
          {tenantId && <TenantDetail tenantId={tenantId} />}
        </div>
        <div className={leaseContainerStyles}>
          <ListHeader label="Leases">
            <NewLeaseForm
              propertyId={propertyId}
              unitId={unitId}
              tenantId={tenantId}
            />
          </ListHeader>
          <Nav tabs className="bg-light">
            <NavItem>
              <NavLink
                active={this.state.activeTab === ACTIVE}
                className={tabNavLinkStyles}
                onClick={() => this.toggleTab(ACTIVE)}>
                Active
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={this.state.activeTab === INACTIVE}
                className={tabNavLinkStyles}
                onClick={() => this.toggleTab(INACTIVE)}>
                Inactive
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent
            className={tabContentStyles}
            activeTab={this.state.activeTab}>
            <LeaseCollection authPath="leases" where={where}>
              {(leases, hasLoaded) => {
                const tab = this.state.activeTab
                return (
                  <Fragment>
                    {tab === ACTIVE && (
                      <TabPane tabId={ACTIVE}>
                        <LeasesView
                          key="active"
                          /* leases={hasLoaded ? leases : []} */
                          leases={leases}
                          showProperties={!Boolean(propertyId)}
                          showUnits={!Boolean(unitId)}
                          loading={!hasLoaded}
                        />
                      </TabPane>
                    )}
                    {tab === INACTIVE && (
                      <TabPane tabId={INACTIVE}>
                        <LeasesView
                          key="inactive"
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
            </LeaseCollection>
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

const LeasesView: SFC<LeasesProps> = ({
  leases,
  showProperties,
  showUnits,
  loading = false,
}) => {
  const columns: any = [
    {
      Header: 'Tenants',
      accessor: 'tenants',
      Cell: (row: { original: Lease; isExpanded: any }) => (
        <Cell highlight={row.isExpanded}>
          <StringStack>
            {Object.entries(row.original.tenants)
              .map<string>(([id, { exists, name }]) => name)
              .join('\n')}
          </StringStack>
        </Cell>
      ),
    },
    {
      Header: 'Rent',
      accessor: 'rent',
      Cell: ({ original: l }: { original: Lease }) => (
        <CurrencyCell amount={l.rent} />
      ),
      // todo: what is this for?
      // aggregate: (vals: any[]) => vals[0],
    },
    {
      Header: 'Balance',
      accessor: 'balance',
      Cell: (row: { original: Lease; isExpanded: boolean }) => {
        return (
          <CurrencyCell
            highlight={row.isExpanded}
            amount={row.original.balance || 0}
            css={'font-weight: bold;'}
          />
        )
      }, //CurrencyAddDecimals(l.balance),
    },
    // {
    //   Header: 'Link',
    //   id: 'link',
    //   accessor: (l: Lease) => l.id,
    //   Cell: (row: any) => <Link to={`/lease/${row.value}`}>#</Link>,
    // },
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
  // TODO: look into why loading "fade animation" only seems to run in certain situations.
  // ... adds a flicker sometimes instead of smooth transition.
  return (
    <div key="react-table" className="lease-table">
      <ReactTable
        getTrProps={(state: any, rowInfo: any) => {
          // console.log({ state, rowInfo })
          const index = rowInfo ? rowInfo.index : -1
          const result: any = {}
          if (index >= 0) {
            const isExpanded = !!state.expanded[index]
            if (isExpanded) {
              result.style = {
                fontSize: '1.3em',
                backgroundColor: '#E1F5FE',
              }
            }
          }
          return result
        }}
        collapseOnDataChange={false}
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

interface TransactionsTableProps {
  lease: Lease
}
interface TransactionsTableState {
  type: TransactionType
}
class TransactionsSubComponent extends React.Component<
  TransactionsTableProps,
  TransactionsTableState
> {
  state: TransactionsTableState = {
    type: 'PAYMENT',
  }
  handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const type = value as TransactionType
    this.setState(() => ({ type }))
  }
  render() {
    const { lease } = this.props
    return (
      <div
        css={`
          display: flex;
          flex-direction: row-reverse;
          align-items: stretch;
          flex-wrap: wrap;
          padding: 1em 0.5em 1em 0.5em;
          .transactions {
            flex: 2;
            margin: 0 0.5em 1em 0.5em;
          }
          .controls {
            border: none;
            min-width: 350px;
            display: flex;
            flex-direction: column;
            flex: 1;
            .control-forms {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              .content {
                display: flex;
                justify-content: center;
              }
            }
          }
        `}>
        <Card className="controls">
          <CardBody>
            <CardTitle
              css={{
                textTransform: 'uppercase',
                fontVariantCaps: 'small-caps',
                fontSize: '1em',
              }}>
              Actions
            </CardTitle>
            <Form inline>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  value="PAYMENT"
                  id="paymentRadio"
                  onChange={this.handleTypeChange}
                  checked={this.state.type === 'PAYMENT'}
                />
                <label className="form-check-label" htmlFor="paymentRadio">
                  Payment
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  value="CHARGE"
                  id="chargeRadio"
                  onChange={this.handleTypeChange}
                  checked={this.state.type === 'CHARGE'}
                />
                <label className="form-check-label" htmlFor="chargeRadio">
                  Charge
                </label>
              </div>
            </Form>
          </CardBody>
          <CardBody>
            <div className="content">
              {this.state.type === 'PAYMENT' ? (
                <PaymentForm lease={lease} />
              ) : (
                <ChargeForm lease={lease} />
              )}
            </div>
          </CardBody>
        </Card>
        <CollectionTransaction
          authPath={`leases/${lease.id}/transactions`}
          orderBy={{ field: 'date', direction: 'desc' }}>
          {(transactions, hasLoaded) => (
            <div className="transactions">
              <CardBody>
                <CardTitle
                  css={{
                    textTransform: 'uppercase',
                    fontVariantCaps: 'small-caps',
                    fontSize: '1em',
                  }}>
                  Transactions
                </CardTitle>
              </CardBody>
              <ReactTable
                collapseOnDataChange={false}
                className={transactionTableStyle}
                loading={!hasLoaded}
                data={transactions}
                defaultPageSize={10}
                columns={[
                  {
                    Header: 'type',
                    accessor: 'type',
                    Cell: ({
                      original: { type, subType },
                    }: {
                      original: Transaction
                    }) => {
                      return (
                        <div
                          css={'display: flex; & > * {margin-right: 0.5em;}'}>
                          <Badge
                            pill
                            color={type === 'CHARGE' ? 'secondary' : 'success'}>
                            {type}
                          </Badge>
                          {subType ? (
                            <Badge
                              pill
                              color={
                                subType === 'LATE_FEE' ? 'danger' : 'primary'
                              }>
                              {subType.replace('_', ' ')}
                            </Badge>
                          ) : null}
                        </div>
                      )
                    },
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
                        <div
                          className={cx({
                            'text-success': type === 'PAYMENT',
                          })}>
                          <CurrencyCell
                            amount={value}
                            formatNegative={type === 'PAYMENT'}
                          />
                        </div>
                      )
                    },
                  },
                  {
                    Header: 'date',
                    id: 'date',
                    accessor: (t: Transaction) =>
                      format(t.date.toDate(), 'EEE d MMM YYYY'),
                    Cell: ({ value }: any) => (
                      <div css={'text-align: right;'}>{value}</div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </CollectionTransaction>
      </div>
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
      <PropertyDoc authPath={`properties/${propertyId}`}>
        {property => (
          <Card>
            <CardBody>
              <CardText className="text-secondary">Property</CardText>
              <CardTitle className="color-properties">
                {property && property.name}
              </CardTitle>
            </CardBody>
          </Card>
        )}
      </PropertyDoc>
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
    <UnitDoc authPath={`properties/${propertyId}/units/${unitId}`}>
      {unit =>
        unit ? (
          <Card>
            <CardBody>
              <CardText className="text-secondary">Unit</CardText>
              <CardTitle className="color-units">{unit.label}</CardTitle>
            </CardBody>
          </Card>
        ) : null
      }
    </UnitDoc>
  )
}

class TenantDoc extends Document<Tenant> {}
const TenantDetail: SFC<RouteProps & { tenantId: string }> = ({ tenantId }) => {
  return (
    <TenantDoc authPath={`tenants/${tenantId}`}>
      {tenant => (
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
    </TenantDoc>
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
