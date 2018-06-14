import React, { SFC } from 'react'
import { Collection } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
import { Property, Unit } from '../types'
import Component from '@reactions/component'
import { ListGroup, ListGroupItem } from 'reactstrap'
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

// const PropertyDetail = ({propertyId}: any) => {
//   return (
//     <Router>
//       <PropertyHeader
//         path=":propertyId"
//         getProperty={getGetProperty(properties)}
//       />
//     </Router>
//   )
// }

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

// const getGetProperty = (properties: Property[]) => (id: string) =>
//   properties.find(p => p.id === id)
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
                background-color: papayawhip;
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
              }}>
              <ListGroup
                css={`
                  max-height: 100%;
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
                          <ListGroup
                            flush
                            css={`
                              max-height: 100%;
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

/*
<Units
        key={propertyId}
        path={`companies/${activeCompany}/properties/${propertyId}/units`}
        render={units => {
          return (
            <ul>
              {units.map(u => {
                return <li key={u.id}>{u.address}</li>
              })}
            </ul>
          )
        }}
      />

*/

export default Dashboard
