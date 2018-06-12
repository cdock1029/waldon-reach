import React, { SFC } from 'react'
import { Collection, Doc } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
import { Property } from '../types'
import PropertyDetail from '@page/PropertyDetail'

interface DashboardProps {
  activeCompany?: string
}

class Properties extends Collection<Property> {}

const PropertyHeader = ({ propertyId, getProperty }: any) => {
  const property = getProperty(propertyId)
  return <h3>{property && property.name}</h3>
}
// const Body: any = (properties: Property[]) => (
// )

const getGetProperty = (properties: Property[]) => (id: string) =>
  properties.find(p => p.id === id)
const Dashboard: SFC<RouteProps & DashboardProps> = ({ activeCompany }) => {
  return (
    <div>
      <h3>Dashboard</h3>
      <Properties
        path={`companies/${activeCompany}/properties`}
        render={properties => {
          return (
            <div css={{ display: 'flex', flexDirection: 'column' }}>
              <Router>
                <PropertyHeader
                  path=":propertyId"
                  getProperty={getGetProperty(properties)}
                />
              </Router>
              <ul>
                {properties.map(p => (
                  <li key={p.id}>
                    <Link to={p.id}>{p.name}</Link>
                  </li>
                ))}
              </ul>
              <Router>
                <PropertyDetail
                  path=":propertyId"
                  activeCompany={activeCompany}
                />
              </Router>
            </div>
          )
        }}
      />
    </div>
  )
}

export default Dashboard
