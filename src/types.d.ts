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
