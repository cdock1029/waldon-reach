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
import LeaseContainer from '../components/LeaseContainer'
import { css, cx } from 'react-emotion'

class PropertiesCollection extends Collection<Property> {}
class UnitsCollection extends Collection<Unit> {}

const Units: SFC<RouteProps & { propertyId?: string }> = unitProps => {
  const propertyId = unitProps.propertyId!
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
                      to={`units/${u.id}`}
                      tag={props => {
                        return (
                          <Link
                            getProps={isPartiallyActive(props.className)}
                            {...props}
                          />
                        )
                      }}>
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

const Properties: SFC<RouteProps> = (props: any) => {
  console.log('render properties', { props })
  return (
    <PropertiesCollection
      path="/*"
      authPath={claims => `companies/${claims.activeCompany}/properties`}
      orderBy={{ field: 'name', direction: 'asc' }}
      render={properties => {
        console.log('render properties collection')
        return (
          <div className={propertiesGridStyles}>
            <div className={leaseSectionStyles}>
              <Switch>
                <Route component={LeaseContainer} path="/properties" />
                <Route
                  component={LeaseContainer}
                  path="/properties/:propertyId"
                />
                <Route
                  component={LeaseContainer}
                  path="/properties/:propertyId/units/:unitId"
                />
              </Switch>
            </div>
            <div className={propertiesListSectionStyles}>
              <Component
                initialState={{ modal: false }}
                toggleCallback={({ modal }: any) => ({ modal: !modal })}
                render={({ setState, props: { toggleCallback } }: any) => (
                  <>
                    <h6 className={listHeaderStyles}>
                      Properties{' '}
                      <Badge
                        color="secondary"
                        onClick={() => setState(toggleCallback)}>
                        New
                      </Badge>
                    </h6>
                  </>
                )}
              />
              <ListGroup className={propertiesListWrapStyles} flush>
                {properties.map(p => {
                  return (
                    <ListGroupItem
                      action
                      key={p.id}
                      to={`/properties/${p.id}`}
                      tag={Link}
                      activeClassName="active">
                      {p.name}
                    </ListGroupItem>
                  )
                })}
              </ListGroup>
            </div>
            <div className={unitsListSectionStyles}>
              <Route component={Units} path="/properties/:propertyId" />
            </div>
          </div>
        )
      }}
    />
  )
}
const propertiesGridStyles = css({
  display: 'grid',
  /* height: 'calc(100vh - var(--header-height))', */
  gridTemplateAreas: `
    "props lease"
    "units lease"
  ;`,
  gridTemplateColumns: '250px 1fr',
  gridTemplateRows: `
    calc(2 * (100vh - var(--header-height))/5)
    calc(3 * (100vh - var(--header-height))/5)
  `,
  label: 'PropertiesParentGrid',
})

const unitsListSectionStyles = css({
  gridArea: 'units',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  paddingBottom: '1em',
  label: 'UnitsGridArea',
})
const propertiesListSectionStyles = css({
  gridArea: 'props',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  borderBottom: '1px solid rgba(0,0,0,0.1)',
  label: 'PropsGridArea',
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

export default Properties
