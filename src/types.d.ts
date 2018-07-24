declare module '@reach/router'
declare module '@reactions/component'

declare module '*.mdx' {
  let MDXComponent: (props: any) => JSX.Element
  export default MDXComponent
}

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
  address: string
}
interface Tenant extends Doc {
  firstName: string
  lastName: string
  email?: string
}
