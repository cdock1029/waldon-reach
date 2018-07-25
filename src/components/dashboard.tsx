import React, { SFC } from 'react'
import { Collection } from '../components/FirestoreData'
import { Route, Link, Switch } from 'react-static'
import Component from '@reactions/component'
import {
  ListGroup,
  ListGroupItem,
  Badge,
  Card,
  CardText,
  CardTitle,
} from 'reactstrap'
import { collator, isPartiallyActive } from '../lib/index'
import NewUnitForm from '../components/NewUnitForm'
// import LeaseContainer, {LeaseContainerProps} from '../components/LeaseContainer'
import { css, cx } from 'react-emotion'

class PropertiesCollection extends Collection<Property> {}
class UnitsCollection extends Collection<Unit> {}

const Units: SFC<RouteProps> = (props: any) => {
  const propertyId = props.match.params.propertyId!
  return (
    <UnitsCollection
      key={propertyId}
      authPath={claims =>
        `companies/${claims.activeCompany}/properties/${propertyId}/units`
      }
      transform={units =>
        units.sort((a, b) => collator.compare(a.address, b.address))
      }
      render={(units, hasLoaded) => {
        return (
          <>
            <Component
              initialState={{ modal: false }}
              render={({ setState, state: { modal } }: any) => (
                <h6 className={listHeaderStyles}>
                  Units{' '}
                  <Badge
                    onClick={() =>
                      setState(({ modal: m }: any) => ({
                        modal: !m,
                      }))
                    }
                    color="secondary">
                    New
                  </Badge>
                  <NewUnitForm
                    propertyId={propertyId}
                    isModalOpen={modal}
                    toggleModal={() =>
                      setState(({ modal: m }: any) => ({
                        modal: !m,
                      }))
                    }
                  />
                </h6>
              )}
            />
            <ListGroup flush className={unitsListWrapStyles}>
              {units.length ? (
                units.map(u => {
                  return (
                    <ListGroupItem
                      action
                      key={u.id}
                      to={`/properties/${propertyId}/units/${u.id}`}
                      tag={Link}>
                      {u.address}
                    </ListGroupItem>
                  )
                })
              ) : hasLoaded ? (
                <div className={css({ padding: '1em' })}>
                  <Card body>
                    <CardTitle>No units</CardTitle>
                    <CardText>
                      click <code>New</code> to create a new unit
                    </CardText>
                  </Card>
                </div>
              ) : null}
            </ListGroup>
          </>
        )
      }}
    />
  )
}

export const Dashboard: SFC<
  RouteProps & { leaseContainer: any; sidebarItems: any[] }
> = props => {
  const { leaseContainer, sidebarItems } = props
  // const properties = [{ name: 'A property', id: 'id' }]
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
  /* height: 'calc(100vh - var(--header-height))', */
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
  flexBasis: 'auto',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  borderBottom: '1px solid rgba(0,0,0,0.1)',
  label: 'SidebarItem',
})

const leaseSectionStyles = css`
  grid-area: lease;
  display: grid;
  display: flex;
  flex-direction: column;
  label: LeaseGridArea;
  padding-bottom: 1rem;
  overflow: hidden;
  &:first-child {
    overflow-y: scroll;
  }
`

const propertiesListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
  .list-group-item.list-group-item-action.active {
    color: #fff;
    background-color: #0c5460;
    border-color: #0c5460;
  }
`
const unitsListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
  .list-group-item.list-group-item-action.active {
    color: #fff;
    background-color: #155724;
    border-color: #155724;
  }
`
const listHeaderStyles = cx(
  'bg-light',
  css`
    padding: 0.5em;
    margin: 0;
    display: flex;
    justify-content: space-between;
    .badge {
      cursor: pointer;
    }
  `,
)

export default () => {
  return (
    <Dashboard
      sidebarItems={[<div>item 1</div>, <div>item 2</div>]}
      leaseContainer={<h1>lease container</h1>}
    />
  )
}
