declare module '@reach/router'
declare module '@reactions/component'

interface RouteProps {
  path?: string
  default?: boolean
}

interface Doc {
  id: string
}
interface Property extends Doc {
  name: string
}
interface Unit extends Doc {
  address: string
}
interface Tenant extends Doc {
  firstName: string
  lastName: string
  email?: string
}
interface Lease extends Doc {
  rent: number
  balance: number
  tenants: { [id: string]: { exists: boolean; name: string } }
  units: { [id: string]: { exists: boolean; address: string } }
  properties: { [id: string]: { exists: boolean; name: string } }
  startDate?: string
  endDate?: string
  active: boolean
}
