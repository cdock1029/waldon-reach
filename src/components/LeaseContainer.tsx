import React, { SFC } from 'react'
import {
  Container,
  CardBody,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col,
  CardSubtitle,
} from 'reactstrap'
import { auth, firestore, FirestoreTypes as fs } from '@lib/firebase'
import { css, cx } from 'react-emotion'
import ReactTable from 'react-table'
import { Document } from '@comp/FirestoreData'
// import 'react-table/react-table.css'

interface LeaseContainerProps extends RouteProps {
  activeCompany: string
  propertyId?: string
  unitId?: string
  tenantId?: string
}
interface LeaseContainerState {
  leases: Lease[]
  activeTab: string
  loading: boolean
}
const Test = (props: any) => {
  console.log({ props })
  return (
    <div>
      <h1>hello</h1>
    </div>
  )
}

class LeaseContainer extends React.Component<
  LeaseContainerProps,
  LeaseContainerState
> {
  leasesRef: fs.CollectionReference
  unsub: () => void
  defaultState = {
    leases: [],
    activeTab: '1',
    loading: true,
  }
  constructor(props: LeaseContainerProps) {
    super(props)
    this.state = this.defaultState
    const companyRef = firestore.doc(`companies/${props.activeCompany}`)
    this.leasesRef = companyRef.collection('leases')
  }
  toggleTab(tab: string) {
    if (this.state.activeTab !== tab) {
      this.setState(() => ({ activeTab: tab }))
    }
  }
  componentDidMount() {
    this.setupQuery()
  }
  componentDidUpdate({ propertyId, unitId, tenantId }: LeaseContainerProps) {
    if (
      propertyId !== this.props.propertyId ||
      unitId !== this.props.unitId ||
      tenantId !== this.props.tenantId
    ) {
      this.setState(() => this.defaultState)
      this.unsubQuery()
      this.setupQuery()
    }
  }
  setupQuery = () => {
    // console.log('CDM LeaseContainer')
    const { propertyId, unitId, tenantId } = this.props
    // let ref: fs.DocumentReference = this.companyRef
    let query: fs.Query = this.leasesRef
    if (propertyId) {
      // ref = ref.collection('properties').doc(propertyId) as fs.DocumentReference
      query = query.where(`properties.${propertyId}.exists`, '==', true)
      if (unitId) {
        // ref = ref.collection('units').doc(unitId)
        query = query.where(`units.${unitId}.exists`, '==', true)
      }
    }
    if (tenantId) {
      // ref = ref.collection('tenants').doc(tenantId)
      query = query.where(`tenants.${tenantId}.exists`, '==', true)
    }
    this.unsub = query.onSnapshot(this.handleLeasesSnap)
  }
  unsubQuery = () => {
    // console.log('CWU LeaseContainer')
    if (this.unsub) {
      this.unsub()
    }
  }
  componentWillUnmount() {
    this.unsubQuery()
  }
  handleLeasesSnap = (snap: fs.QuerySnapshot) => {
    const data: any = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    this.setState(() => ({ leases: data, loading: false }))
  }
  render() {
    const { activeCompany, propertyId, unitId, tenantId } = this.props
    const { leases } = this.state
    console.log({ leaseContainer: this.props })
    return (
      <>
        <div
          className={css`
            padding: 1em;
            display: grid;
            grid-gap: 1em;
            grid-template-columns: 1fr 1fr;
            /* & > * {
              flex: 1;
            } */
          `}>
          {propertyId && (
            <PropertyDetail propertyId={propertyId}>
              {unitId && <UnitDetail propertyId={propertyId} unitId={unitId} />}
            </PropertyDetail>
          )}
        </div>
        <Container className={leaseContainerStyles}>
          <Row>
            <Col>
              <h5>Leases</h5>
            </Col>
          </Row>
          <Row>
            <Col>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={cx(
                      { active: this.state.activeTab === '1' },
                      tabNavLinkStyles,
                    )}
                    onClick={() => this.toggleTab('1')}>
                    Active
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={cx(
                      { active: this.state.activeTab === '2' },
                      tabNavLinkStyles,
                    )}
                    onClick={() => this.toggleTab('2')}>
                    Inactive
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent
                className={tabContentStyles}
                activeTab={this.state.activeTab}>
                <TabPane tabId="1">
                  <Container>
                    <Row>
                      <Col>
                        <LeasesView leases={leases} />
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
  padding-top: 1em;
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
  <LeaseContainer {...props} activeCompany={auth.activeCompany} />
)

export default AuthLeaseContainer

interface LeasesProps {
  leases: Lease[]
  loading?: boolean
}
const LeasesView: SFC<LeasesProps> = ({ leases, loading = false }) => {
  return (
    <div>
      <ReactTable
        loading={loading}
        data={leases}
        columns={[
          {
            Header: 'Tenants',
            columns: [
              {
                Header: 'Name',
                id: 'name',
                accessor: (l: Lease) =>
                  Object.entries(l.tenants)
                    .map<string>(([id, { exists, name }]) => name)
                    .join(', '),
              },
            ],
          },
          {
            Header: 'Rent',
            accessor: 'rent',
          },
          {
            Header: 'Balance',
            accessor: 'balance',
          },
          {
            Header: 'Properties',
            id: 'properties',
            accessor: (l: Lease) =>
              Object.entries(l.properties)
                .map<string>(([id, { exists, name }]) => name)
                .join(', '),
          },
          {
            Header: 'Units',
            id: 'units',
            accessor: (l: Lease) =>
              Object.entries(l.units)
                .map<string>(([id, { exists, address }]) => address)
                .join(', '),
          },
        ]}
        defaultPageSize={10}
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

const detailCardStyles = css`
  height: 100%;
`
