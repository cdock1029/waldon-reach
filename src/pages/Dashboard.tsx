import React, { SFC } from 'react'
import { Collection } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
import { Property, Unit } from '../types'
import Component from '@reactions/component'
import {
  ListGroup,
  ListGroupItem,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap'
import { collator } from '@lib/index'

interface DashboardProps {
  activeCompany?: string
}

const isActive = ({ isCurrent }: any) => {
  return isCurrent ? { className: 'active' } : null
}
const isPartiallyActive = (classes: string) => ({
  isPartiallyCurrent,
}: any) => {
  return isPartiallyCurrent ? { className: `${classes} active` } : null
}

class Properties extends Collection<Property> {}
class Units extends Collection<Unit> {}

const PropertyDetail = (props: any) => {
  console.log({ props })
  return (
    <div css={{ padding: '1em' }}>
      <small>Property id: {props.propertyId}</small>
      {props.children}
    </div>
  )
}
const UnitDetail = ({ propertyId, unitId }: any) => {
  return (
    <div>
      <h4>P: {propertyId}</h4>
      <small>Uid: {unitId}</small>
    </div>
  )
}

const showAlert = () => alert('yo')

const Dashboard: SFC<RouteProps & DashboardProps> = ({
  activeCompany,
  ...rest
}) => {
  console.log({ rest })
  return (
    <Properties
      path={`companies/${activeCompany}/properties`}
      orderBy={{ field: 'name', direction: 'asc' }}
      render={properties => {
        return (
          <div
            css={{
              display: 'grid',
              gridTemplateAreas: `
                "header header"
                "props dash"
                "props dash"
                "units dash"
                "units dash"
                "units dash"
              ;`,
              gridTemplateColumns: 'minmax(0, 250px) 1fr',
              gridTemplateRows: '4rem repeat(5, calc((100vh - 7.5rem) / 5))',
            }}>
            <div
              css={`
                grid-area: header;
                border-top: 1px solid rgba(0, 0, 0, 0.12);
                border-bottom: 1px solid rgba(0, 0, 0, 0.12);
                /* background-color: papayawhip; */
                padding: 0.5em;
              `}>
              <h3>todo</h3>
            </div>
            <div
              css={{
                gridArea: 'dash',
              }}>
              <Router>
                <PropertyDetail path=":propertyId">
                  <UnitDetail path="units/:unitId" />
                </PropertyDetail>
              </Router>
            </div>
            <div
              css={{
                gridArea: 'props',
                paddingTop: '0.5em',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}>
              <Component
                initialState={{ modal: false }}
                toggleCallback={({ modal }: any) => ({ modal: !modal })}
                render={({
                  setState,
                  props: { toggleCallback },
                  state,
                }: any) => (
                  <>
                    <h6
                      css={{
                        paddingLeft: '0.5em',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                      Properties{' '}
                      <Badge
                        css={{ cursor: 'pointer' }}
                        color="secondary"
                        onClick={() => setState(toggleCallback)}>
                        New
                      </Badge>
                    </h6>
                    <Modal
                      centered
                      isOpen={state.modal}
                      toggle={() => setState(toggleCallback)}>
                      <ModalHeader
                        css={{ flexDirection: 'row' }}
                        toggle={() => setState(toggleCallback)}>
                        New Property
                      </ModalHeader>
                      <ModalBody>
                        <h4>New Property form TODO</h4>
                      </ModalBody>
                    </Modal>
                  </>
                )}
              />
              <ListGroup
                css={`
                  /* max-height: 100%; */
                  flex: 1;
                  overflow-y: scroll;
                `}
                flush>
                {properties.map(p => {
                  return (
                    <ListGroupItem
                      color="success"
                      action
                      key={p.id}
                      to={p.id}
                      tag={props => {
                        const fn: any = isPartiallyActive(props.className)
                        return <Link getProps={fn} {...props} />
                      }}>
                      {p.name}
                    </ListGroupItem>
                  )
                })}
              </ListGroup>
            </div>
            <Router
              css={{
                gridArea: 'units',
                padding: '0.5em 0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}>
              <Component
                path=":propertyId/*"
                render={({ props: { propertyId } }: any) => {
                  return (
                    <Units
                      key={propertyId}
                      path={`companies/${activeCompany}/properties/${propertyId}/units`}
                      transform={units =>
                        units.sort((a, b) =>
                          collator.compare(a.address, b.address),
                        )
                      }
                      render={units => {
                        return (
                          <>
                            <h6
                              css={{
                                paddingLeft: '0.5em',
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}>
                              Units{' '}
                              <Badge
                                css={{ cursor: 'pointer' }}
                                color="secondary">
                                New
                              </Badge>
                            </h6>
                            <ListGroup
                              flush
                              css={`
                                /* max-height: 100%; */
                                flex: 1;
                                overflow-y: scroll;
                                /*.list-group-item-action.active {
                                  color: #fff;
                                  background-color: var(--info);
                                  border-color: #0c5460;
                                }*/
                              `}>
                              {units.map(u => {
                                return (
                                  <ListGroupItem
                                    action
                                    color="info"
                                    key={u.id}
                                    to={`units/${u.id}`}
                                    tag={props => (
                                      <Link
                                        getProps={isPartiallyActive(
                                          props.className,
                                        )}
                                        {...props}
                                      />
                                    )}>
                                    {u.address}
                                  </ListGroupItem>
                                )
                              })}
                            </ListGroup>
                          </>
                        )
                      }}
                    />
                  )
                }}
              />
            </Router>
          </div>
        )
      }}
    />
  )
}

export default Dashboard
