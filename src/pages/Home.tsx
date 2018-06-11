import React, { SFC } from 'react'
import { css } from 'react-emotion'

const Home: SFC<RouteProps> = props => (
  <div className={homeStyle}>
    <h3>Home</h3>
    {props.children}
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </div>
)

const homeStyle = css`
  color: darkred;
  label: HOME;
`

export default Home
