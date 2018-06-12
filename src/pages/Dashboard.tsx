import React, { SFC } from 'react'
import { Collection, Doc } from '@comp/FirestoreData'
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

const PropertyHeader = ({ propertyId, getProperty }: any) => {
  const property = getProperty(propertyId)
  return <h3>{property && property.name}</h3>
}

const getGetProperty = (properties: Property[]) => (id: string) =>
  properties.find(p => p.id === id)
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
                "props header"
                "props ."
                "units ."
              ;`,
              gridTemplateColumns: 'auto 1fr',
              gridTemplateRows: '110px repeat(2, calc((100vh - 170px) / 2))',
            }}>
            <div
              css={{
                gridArea: 'header',
                // gridColumn: '2 / 3',
              }}>
              <Router>
                <PropertyHeader
                  path=":propertyId"
                  getProperty={getGetProperty(properties)}
                />
              </Router>
            </div>
            <ListGroup
              flush
              css={{
                padding: '1em 0.5em',
                border: '1px solid rgba(0,0,0,0.2)',
                gridArea: 'props',
                maxHeight: '100%',
                overflowY: 'scroll',
              }}>
              {properties.map(p => {
                return (
                  <ListGroupItem
                    action
                    key={p.id}
                    tag={props => {
                      const fn: any = isPartiallyActive(props.className)
                      return <Link getProps={fn} {...props} />
                    }}
                    to={p.id}>
                    {p.name}
                  </ListGroupItem>
                )
              })}
            </ListGroup>
            <div
              css={{
                gridArea: 'units',
                maxHeight: '100%',
                overflowY: 'scroll',
              }}>
              <Router>
                <Component
                  path=":propertyId"
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
                              css={{
                                padding: '1em 0.5em',
                                border: '1px solid rgba(0,0,0,0.2)',
                              }}
                              flush>
                              {units.map(u => {
                                return (
                                  <ListGroupItem key={u.id}>
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
