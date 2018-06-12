import React, { SFC } from 'react'
import { Collection, Doc } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
import { Property, Unit } from '../types'
import Component from '@reactions/component'

interface DashboardProps {
  activeCompany?: string
}

class Properties extends Collection<Property> {}
class Units extends Collection<Unit> {}

const PropertyHeader = ({ propertyId, getProperty }: any) => {
  const property = getProperty(propertyId)
  return <h3>{property && property.name}</h3>
}

const getGetProperty = (properties: Property[]) => (id: string) =>
  properties.find(p => p.id === id)
const Dashboard: SFC<RouteProps & DashboardProps> = ({ activeCompany }) => {
  return (
    <Properties
      path={`companies/${activeCompany}/properties`}
      render={properties => {
        return (
          <div
            css={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'auto 1fr',
            }}>
            <Router
              css={{
                gridColumn: '2 / 3',
              }}>
              <PropertyHeader
                path=":propertyId"
                getProperty={getGetProperty(properties)}
              />
            </Router>
            <ul css={{ gridColumn: '1 / 2', gridRow: '2' }}>
              {properties.map(p => (
                <li key={p.id}>
                  <Link to={p.id}>{p.name}</Link>
                </li>
              ))}
            </ul>
            <Router>
              <Component
                path=":propertyId"
                render={({ props: { propertyId } }: any) => {
                  return (
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
