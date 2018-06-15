import { Doc } from './components/FirestoreData'

export interface Property extends Doc {
  name: string
}
export interface Unit extends Doc {
  address: string
}
export interface Tenant extends Doc {
  firstName: string
  lastName: string
  email?: string
}
export interface Lease extends Doc {
  rent: number
  balance: number
  tenants: { [id: string]: { exists: boolean; name: string } }
  units: { [id: string]: { exists: boolean; address: string } }
  properties: { [id: string]: { exists: boolean; name: string } }
  startDate?: string
  endDate?: string
  active: boolean
}
