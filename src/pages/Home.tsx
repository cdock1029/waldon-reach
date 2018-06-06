import React, { SFC } from 'react'

const Home: SFC<RouteProps> = props => (
  <div>
    <h3>Home</h3>
    {props.children}
  </div>
)

export default Home
