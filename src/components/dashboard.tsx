import React, { SFC } from 'react'
import { css } from 'react-emotion'

export const Dashboard: SFC<
  RouteProps & { leaseContainer: any; sidebarItems: any[] }
> = props => {
  const { leaseContainer, sidebarItems } = props
  return (
    <div className={dashboardGridStyles}>
      <div className={leaseSectionStyles}>{leaseContainer}</div>
      <div className={sidebarSectionStyles}>
        {sidebarItems.map((item: any, i) => {
          return (
            <div key={i} className={sidebarItemStyles}>
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}
const dashboardGridStyles = css({
  display: 'grid',
  gridTemplateAreas: `
    "sidebar lease"
  `,
  gridTemplateColumns: '250px 1fr',
  gridTemplateRows: 'calc(100vh - var(--header-height))',
  label: 'DashboardGrid',
})

const sidebarSectionStyles = css({
  gridArea: 'sidebar',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  paddingBottom: '1em',
  label: 'SidebarGridArea',
})
const sidebarItemStyles = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  borderBottom: '1px solid rgba(0,0,0,0.1)',
  label: 'SidebarItem',
})

const leaseSectionStyles = css`
  grid-area: lease;
  display: grid;
  grid-template-areas: 'leasesHeader' 'leasesTable';
  grid-template-rows: minmax(min-content, auto) 1fr;
  /* grid-gap: 1em; */
  padding-bottom: 1rem;
  overflow: hidden;
  &:first-child {
    overflow-y: scroll;
  }
`

export default () => {
  return (
    <Dashboard
      sidebarItems={[<div>item 1</div>, <div>item 2</div>]}
      leaseContainer={<h1>lease container</h1>}
    />
  )
}
