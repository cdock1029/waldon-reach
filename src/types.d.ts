declare module '@reach/router'
declare module '@reactions/component'

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
  balance: number
  tenants: { [id: string]: { exists: boolean; name: string } }
  units: { [id: string]: { exists: boolean; address: string } }
  properties: { [id: string]: { exists: boolean; name: string } }
  startDate?: string
  endDate?: string
  status: string
}

interface Transaction extends Doc {
  amount: number
  date: { toDate(): Date }
  type: 'PAYMENT' | 'CHARGE'
}

type WhereParam = [
  string | firebase.firestore.FieldPath,
  firebase.firestore.WhereFilterOp,
  any
]

type Unsub = () => void
