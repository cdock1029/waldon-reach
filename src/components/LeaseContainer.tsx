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
} from 'reactstrap'
import {
  firestore,
  FirestoreTypes as fs,
  onAuthStateChangedWithClaims,
} from '../lib/firebase'
import { notBuilding } from '../lib'
import styled, { css } from 'react-emotion'
import ReactTable from 'react-table'
import { Document } from '../components/FirestoreData'
import { CurrencyAddDecimals } from '../lib/index'
import { NavLink as Link } from 'react-router-dom'

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
  leases: Lease[]
  activeTab: LeaseActiveFilter
  loading: boolean
}

class LeaseContainer extends React.Component<
  LeaseContainerProps,
  LeaseContainerState
> {
  leasesRef: fs.CollectionReference
  unsub: Array<firebase.Unsubscribe> = []
  defaultState: LeaseContainerState = {
    leases: [],
    activeTab: LeaseActiveFilter.ACTIVE, // or 'inactive
    loading: true,
  }
  constructor(props: LeaseContainerProps) {
    super(props)
    this.state = this.defaultState
  }
  toggleTab(tab: LeaseActiveFilter) {
    if (this.state.activeTab !== tab) {
      this.setState(() => ({ activeTab: tab }))
    }
  }
  componentDidMount() {
    this.setupQuery()
  }
  componentDidUpdate(
    { propertyId, unitId, tenantId }: LeaseContainerProps,
    { activeTab }: LeaseContainerState,
  ) {
    if (
      propertyId !== this.props.propertyId ||
      unitId !== this.props.unitId ||
      tenantId !== this.props.tenantId ||
      activeTab !== this.state.activeTab
    ) {
      // TODO: this is getting messy. reloading query involves props & state..
      this.setState(() => ({
        ...this.defaultState,
        activeTab: this.state.activeTab,
      }))
      this.unsubQuery()
      this.setupQuery()
    }
  }
  setupQuery = () => {
    if (notBuilding()) {
      const { propertyId, unitId, tenantId } = this.props
      const { activeTab } = this.state

      this.unsub.push(
        onAuthStateChangedWithClaims(['activeCompany'], ({ user, claims }) => {
          if (!user) {
            this.setState(
              ({ leases }) => (leases.length ? { leases: [] } : null),
            )
          } else {
            const activeCompany = claims.activeCompany
            const leasesRef = firestore
              .doc(`companies/${activeCompany}`)
              .collection('leases')
            let query: fs.Query = leasesRef.where('status', '==', activeTab)

            if (propertyId) {
              query = query.where(`properties.${propertyId}.exists`, '==', true)
              if (unitId) {
                query = query.where(`units.${unitId}.exists`, '==', true)
              }
            }
            if (tenantId) {
              query = query.where(`tenants.${tenantId}.exists`, '==', true)
            }
            this.unsub.push(query.onSnapshot(this.handleLeasesSnap))
          }
        }),
      )
    }
  }
  unsubQuery = () => {
    if (this.unsub.length) {
      this.unsub.forEach(u => u())
    }
  }
  componentWillUnmount() {
    this.unsubQuery()
  }
  handleLeasesSnap = (snap: fs.QuerySnapshot) => {
    const leases: Lease[] = snap.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as Lease),
    )
    this.setState(() => ({ leases, loading: false }))
  }
  render() {
    const { propertyId, unitId, tenantId } = this.props
    const { leases } = this.state
    console.log('leaseContainer', { propertyId, unitId, tenantId })
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
                <TabPane tabId={LeaseActiveFilter.ACTIVE}>
                  <Row>
                    <Col>
                      <LeasesView
                        leases={leases}
                        showProperties={!Boolean(propertyId)}
                        showUnits={!Boolean(unitId)}
                      />
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tabId={LeaseActiveFilter.INACTIVE}>
                  <Row>
                    <Col>
                      <LeasesView
                        leases={leases}
                        showProperties={!Boolean(propertyId)}
                        showUnits={!Boolean(unitId)}
                      />
                    </Col>
                  </Row>
                </TabPane>
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
const LeasesView: SFC<LeasesProps> = ({
  leases,
  showProperties,
  showUnits,
  loading = false,
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
  return (
    <ReactTable
      loading={loading}
      data={leases}
      columns={columns}
      defaultPageSize={15}
      pageSizeOptions={[10, 15, 50, 100]}
      className="-striped -highlight"
    />
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
              <CardSubtitle>{unit.address}</CardSubtitle>
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
  height: 100%;
`

const leaseContainerStyles = css`
  grid-area: leasesTable;
  display: block;
  padding: 0 1em;
  .lease-item {
    border: 1px solid #000;
    padding: 1em;
  }
`
const tabContentStyles = css`
  padding-top: 1em;
`
const tabNavLinkStyles = css`
  cursor: pointer;
`

export default LeaseContainer
