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
