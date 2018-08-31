declare module '@reach/router'
declare module '@reactions/component'
declare module 'dinero.js'
declare module 'react-instantsearch-dom'
declare module '@reach/menu-button'
declare module 'system-components/emotion'

declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element
  export default MDXComponent
}
declare module 'react-values'

interface RouteProps {
  path?: string
  default?: boolean
  uri?: string
}

interface Doc {
  id: string
  createdAt?: firebase.firestore.Timestamp
  updatedAt?: firebase.firestore.Timestamp
}
interface Property extends Doc {
  name: string
}
interface Unit extends Doc {
  label: string
}
interface Tenant extends Doc {
  firstName: string
  lastName: string
  email?: string
}

interface Lease extends Doc {
  rent: number
  securityDeposit: number
  balance: number
  tenants: { [id: string]: { exists: boolean; name: string } }
  units: { [id: string]: { exists: boolean; address: string } }
  properties: { [id: string]: { exists: boolean; name: string } }
  startDate?: Date
  endDate?: Date
  status: 'ACTIVE' | 'INACTIVE' | 'COLLECTIONS'
}

type TransactionType = 'PAYMENT' | 'CHARGE'
type TransactionSubType = 'RENT' | 'LATE_FEE' // todo: allow for more charge types

interface Transaction extends Doc {
  amount: number
  date: firebase.firestore.Timestamp // | firebase.firestore.FieldValue
  type: TransactionType
  subType?: TransactionSubType
}

type WhereParam = [
  string | firebase.firestore.FieldPath,
  firebase.firestore.WhereFilterOp,
  any
]

type Unsub = () => void
