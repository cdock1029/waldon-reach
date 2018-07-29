import React, { SFC, Fragment } from 'react'
import {
  CardBody,
  Badge,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  CardTitle,
  CardText,
  Row,
  Col,
  CardSubtitle,
  Alert,
} from 'reactstrap'
import styled, { css, cx } from 'react-emotion'
import ReactTable from 'react-table'
import { Document, Collection } from '../components/FirestoreData'
import { CurrencyAddDecimals } from '../lib/index'
import { NavLink as Link } from 'react-router-dom'

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
          <h5
            className={css`
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              .badge {
                cursor: pointer;
              }
            `}>
            Leases
            <Badge color="secondary" onClick={() => alert('yo')}>
              New
            </Badge>
          </h5>
          <Row>
            <Col>
              <Nav tabs>
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
            </Col>
          </Row>
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
      columns: [
        {
          Header: 'Name',
          id: 'name',
          accessor: (l: Lease) => (
            <StringStack>
              {Object.entries(l.tenants)
                .map<string>(([id, { exists, name }]) => name)
                .join('\n')}
            </StringStack>
          ),
        },
      ],
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
      />
    </div>
  )
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
          <Card className={detailCardStyles}>
            <CardBody>
              <CardText>Property</CardText>
              <CardTitle>{property && property.name}</CardTitle>
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
          <Card className={detailCardStyles}>
            <CardBody>
              <CardText>Unit</CardText>
              <CardSubtitle>{unit.label}</CardSubtitle>
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
        <Card className={detailCardStyles}>
          <CardBody>
            <CardText>Tenant</CardText>
            {tenant && (
              <Fragment>
                <CardSubtitle>
                  <div>{`${tenant.firstName} ${tenant.lastName}`}</div>
                </CardSubtitle>
                {tenant.email && <div>{tenant.email}</div>}
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
  min-height: 152px;
  display: grid;
  padding: 1em;
  grid-gap: 1em;
  grid-template-columns: 1fr 1fr;
`
const detailCardStyles = css`
  /* height: 100%;
  margin-bottom: 0;
  */
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

export default LeaseContainer
