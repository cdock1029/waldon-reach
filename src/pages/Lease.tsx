import React, { SFC } from 'react'
import NewLeaseForm from '@comp/NewLeaseForm'

const Lease: SFC<RouteProps> = () => {
  return (
    <div>
      <h2>Lease</h2>
      <NewLeaseForm />
    </div>
  )
}

export default Lease
