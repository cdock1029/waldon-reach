import React, { SFC } from 'react'
import { css } from 'react-emotion'

export const Dashboard: SFC<
  RouteProps & {
    leaseContainer: any
    sidebarItems: any[]
    rightSidebarItems: any[]
  }
> = props => {
  const { leaseContainer, sidebarItems, rightSidebarItems } = props
  return (
    <div className={dashboardGridStyles}>
      <div className={leaseSectionStyles}>{leaseContainer}</div>
      <div className={sidebarSectionStyles}>
        {sidebarItems.map((item: any, i) => {
          return (
            <div key={`leftSidebar${i}`} className={sidebarItemStyles}>
              {item}
            </div>
          )
        })}
      </div>
      <div className={rightSidebarStyles}>
        {rightSidebarItems.map((item: any, i) => {
          return (
            <div key={`rightSidebar${i}`} className={sidebarItemStyles}>
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
    "sidebar lease rightSidebar"
  `,
  gridTemplateColumns: '250px 1fr 250px',
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
const rightSidebarStyles = css({
  gridArea: 'rightSidebar',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  paddingBottom: '1em',
  label: 'RightSidebarGridArea',
})
const sidebarItemStyles = css({
  width: '250px',
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
