import React, { SFC } from 'react'
import styled, { css } from 'react-emotion'
import { ZenConsumer as Zen } from './Zen'

export const Dashboard: SFC<
  RouteProps & {
    leaseContainer: any
    sidebarItems: any[]
    rightSidebarItems?: any[]
  }
> = props => {
  const { leaseContainer, sidebarItems, rightSidebarItems } = props
  return (
    <Zen>
      {({ value }) => (
        <DashBoardGrid zen={value}>
          <div className={leaseSectionStyles}>{leaseContainer}</div>
          <LeftSidebar zen={value}>
            {sidebarItems.map((item: any, i) => {
              return (
                <div key={`leftSidebar${i}`} className={sidebarItemStyles}>
                  {item}
                </div>
              )
            })}
          </LeftSidebar>
          <RightSidebar>
            {rightSidebarItems!.map((item: any, i) => {
              return (
                <div key={`rightSidebar${i}`} className={sidebarItemStyles}>
                  {item}
                </div>
              )
            })}
          </RightSidebar>
        </DashBoardGrid>
      )}
    </Zen>
  )
}
Dashboard.defaultProps = { rightSidebarItems: [] }

const DashBoardGrid: any = styled.div(
  {
    display: 'grid',
    gridTemplateAreas: `
    "sidebar lease rightSidebar"
  `,
    gridTemplateRows: 'calc(100vh - var(--header-height))',
    label: 'DashboardGrid',
  },
  (props: { zen: boolean }) => ({
    gridTemplateColumns: props.zen ? '0 1fr 0' : '250px 1fr 250px', // '250px 1fr 250px',
  }),
)

const LeftSidebar: any = styled.div(
  {
    gridArea: 'sidebar',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingBottom: '1em',
    label: 'SidebarGridArea',
    transition: 'transform 0.3s ease-out',
  },
  ({ zen }: { zen: boolean }) => ({
    transform: `translateX(${zen ? '-250px' : '0'})`,
  }),
)
const RightSidebar = styled.div({
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
  '.list-group-item': {
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
  },
})

const leaseSectionStyles = css`
  grid-area: lease;
  display: grid;
  grid-template-areas: 'leasesHeader' 'leasesTable';
  grid-template-rows: minmax(min-content, auto) 1fr;
  padding-bottom: 1rem;
  overflow: scroll;
`
