import React, { SFC } from 'react'
import {
  Container,
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
import { auth, firestore, FirestoreTypes as fs } from '@lib/firebase'
import styled, { css, cx } from 'react-emotion'
import ReactTable from 'react-table'
import { Document } from '@comp/FirestoreData'
import { CurrencyAddDecimals } from '@lib/index'
import { Link } from '@reach/router'

const enum LeaseActiveFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

interface LeaseContainerProps extends RouteProps {
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
  unsub: () => void
  defaultState: LeaseContainerState = {
    leases: [],
    activeTab: LeaseActiveFilter.ACTIVE, // or 'inactive
    loading: true,
  }
  constructor(props: LeaseContainerProps) {
    super(props)
    this.state = this.defaultState
    const activeCompany = auth.activeCompany
    const companyRef = firestore.doc(`companies/${activeCompany}`)
    this.leasesRef = companyRef.collection('leases')
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
    const { propertyId, unitId, tenantId } = this.props
    const { activeTab } = this.state
    let query: fs.Query = this.leasesRef.where('status', '==', activeTab)

    if (propertyId) {
      query = query.where(`properties.${propertyId}.exists`, '==', true)
      if (unitId) {
        query = query.where(`units.${unitId}.exists`, '==', true)
      }
    }
    if (tenantId) {
      query = query.where(`tenants.${tenantId}.exists`, '==', true)
    }
    this.unsub = query.onSnapshot(this.handleLeasesSnap)
  }
  unsubQuery = () => {
    if (this.unsub) {
      this.unsub()
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
  shouldComponentUpdate(nP: LeaseContainerProps, nS: LeaseContainerState) {
    const { propertyId, unitId, tenantId } = this.props
    const { activeTab, leases, loading } = this.state
    return (
      nP.propertyId !== propertyId ||
      nP.unitId !== unitId ||
      nP.tenantId !== tenantId ||
      nS.activeTab !== activeTab ||
      nS.leases !== leases ||
      nS.loading !== loading
    )
  }
  render() {
    const { propertyId, unitId, tenantId } = this.props
    // console.table([{ ...this.props }])
    const { leases } = this.state
    return (
      <>
        <div
          className={css`
            padding: 1em;
            display: grid;
            grid-gap: 1em;
            grid-template-columns: 1fr 1fr;
          `}>
          {propertyId && <PropertyDetail propertyId={propertyId} />}
          {unitId && <UnitDetail propertyId={propertyId} unitId={unitId} />}
          {tenantId && <TenantDetail tenantId={tenantId} />}
        </div>
        <Container className={leaseContainerStyles}>
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
                    className={cx(
                      {
                        active:
                          this.state.activeTab === LeaseActiveFilter.ACTIVE,
                      },
                      tabNavLinkStyles,
                    )}
                    onClick={() => this.toggleTab(LeaseActiveFilter.ACTIVE)}>
                    Active
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={cx(
                      {
                        active:
                          this.state.activeTab === LeaseActiveFilter.INACTIVE,
                      },
                      tabNavLinkStyles,
                    )}
                    onClick={() => this.toggleTab(LeaseActiveFilter.INACTIVE)}>
                    Inactive
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent
                className={tabContentStyles}
                activeTab={this.state.activeTab}>
                <TabPane tabId={LeaseActiveFilter.ACTIVE}>
                  <Container>
                    <Row>
                      <Col>
                        <LeasesView
                          leases={leases}
                          showProperties={!Boolean(propertyId)}
                          showUnits={!Boolean(unitId)}
                        />
                      </Col>
                    </Row>
                  </Container>
                </TabPane>
                <TabPane tabId={LeaseActiveFilter.INACTIVE}>
                  <Container>
                    <Row>
                      <Col>
                        <LeasesView
                          leases={leases}
                          showProperties={!Boolean(propertyId)}
                          showUnits={!Boolean(unitId)}
                        />
                      </Col>
                    </Row>
                  </Container>
                </TabPane>
              </TabContent>
            </Col>
          </Row>
        </Container>
      </>
    )
  }
}
const leaseContainerStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  label: LeaseContainer;
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

const AuthLeaseContainer: SFC<RouteProps> = props => (
  <div>
    <LeaseContainer {...props} />
  </div>
)

export default AuthLeaseContainer

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
    <>
      <PropertyDoc
        path={`companies/${auth.activeCompany}/properties/${propertyId}`}
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
}) => {
  return (
    <UnitDoc
      path={`companies/${
        auth.activeCompany
      }/properties/${propertyId}/units/${unitId}`}
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
      path={`companies/${auth.activeCompany}/tenants/${tenantId}`}
      render={tenant => (
        <Card className={detailCardStyles}>
          <CardBody>
            <CardText>Tenant</CardText>
            <CardSubtitle>
              {tenant && `${tenant.firstName} ${tenant.lastName}`}
            </CardSubtitle>
          </CardBody>
        </Card>
      )}
    />
  )
}

const detailCardStyles = css`
  height: 100%;
`
const StringStack = styled('pre')`
  margin: 0;
  font-family: var(--font-family-sans-serif);
`
