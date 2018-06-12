import React, { SFC } from 'react'
import { Collection } from '@comp/FirestoreData'
// import { FirebaseAuthConsumer } from '@comp/FirebaseAuth'
import { Unit } from '../types'

interface DetailProps {
  propertyId?: string
  activeCompany?: string
  // getProperty?: (id: string) => Property | undefined
}

class Units extends Collection<Unit> {}

const PropertyDetail: SFC<RouteProps & DetailProps> = ({
  activeCompany,
  propertyId,
}) => {
  console.log({ propertyId, activeCompany })
  // const property = getProperty!(propertyId!)
  return (
    <div>
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
    </div>
  )
}

export default PropertyDetail
