import React from 'react'
import { Container, Row, Col, Card, CardBody } from 'reactstrap'
import firebase from '@lib/firebase'
import { firestore as fs } from 'firebase/app'
import Component from '@reactions/component'
import { Lease } from '../types'

interface LeaseViewProps extends RouteProps {
  activeCompany: string
  propertyId?: string
  unitId?: string
  tenantId?: string
}
interface LeaseViewState {
  leases: Lease[]
}

class LeaseView extends React.Component<LeaseViewProps, LeaseViewState> {
  // companyRef: fs.DocumentReference
  leasesRef: fs.CollectionReference
  unsub: () => void
  constructor(props: LeaseViewProps) {
    super(props)
    this.state = {
      leases: [],
    }
    const companyRef = firebase
      .firestore()
      .doc(`companies/${props.activeCompany}`)
    this.leasesRef = companyRef.collection('leases')
  }
  componentDidMount() {
    // console.log('CDM LeaseView')
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
    console.log({ query })
    this.unsub = query.onSnapshot(this.handleLeasesSnap)
  }
  componentWillUnmount() {
    console.log('CWU LeaseView')
    if (this.unsub) {
      this.unsub()
    }
  }
  handleLeasesSnap = (snap: fs.QuerySnapshot) => {
    const data: any = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    this.setState(() => ({ leases: data }))
  }
  render() {
    const { activeCompany, propertyId, unitId, tenantId } = this.props
    const { leases } = this.state
    return (
      <Container css={{ paddingTop: '1em', paddingBottom: '1em' }}>
        <Row>
          <Col>
            <Card>
              <CardBody>
                <Component
                  // didMount={({setState}: any) => {
                  // }}
                  render={() => {
                    return (
                      <>
                        <h6>Lease view</h6>
                        <div>Company: {activeCompany}</div>
                        <div>Property: {propertyId}</div>
                        <div>Unit: {unitId}</div>
                        <div>Tenant: {tenantId}</div>
                        <br />
                        <h5>Leases</h5>
                        <ul>
                          {leases.map(l => {
                            return (
                              <li
                                css={{
                                  border: '1px solid #000',
                                  padding: '1em',
                                }}
                                key={l.id}>
                                <ul>
                                  <li>Rent: {l.rent}</li>
                                  <li>Balance: {l.balance}</li>
                                  <li>
                                    Tenants:{' '}
                                    {Object.entries(l.tenants)
                                      .map<string>(
                                        ([id, { exists, name }]) => name,
                                      )
                                      .join(', ')}
                                  </li>
                                  <li>
                                    Properties:{' '}
                                    {Object.entries(l.properties)
                                      .map<string>(
                                        ([id, { exists, name }]) => name,
                                      )
                                      .join(', ')}
                                  </li>
                                  <li>
                                    Units:{' '}
                                    {Object.entries(l.units)
                                      .map<string>(
                                        ([id, { exists, address }]) => address,
                                      )
                                      .join(', ')}
                                  </li>
                                </ul>
                              </li>
                            )
                          })}
                        </ul>
                      </>
                    )
                  }}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default LeaseView
