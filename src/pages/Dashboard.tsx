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
              gridTemplateAreas: `
                ". header"
                "props ."
                "units ."
              ;`,
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: 'auto 1fr 1fr',
            }}>
            <div
              css={{
                minHeight: '110px',
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
            <ul
              css={{
                gridArea: 'props',
                /*gridColumn: '1 / 2',
              gridRow: '2',*/
              }}>
              {properties.map(p => (
                <li key={p.id}>
                  <Link to={p.id}>{p.name}</Link>
                </li>
              ))}
            </ul>
            <div
              css={{
                gridArea: 'units',
              }}>
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
