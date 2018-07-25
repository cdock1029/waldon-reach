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
  Modal,
} from 'reactstrap'
import { collator } from '../lib/index'
import NewUnitForm from '../components/NewUnitForm'
import LeaseContainer from '../components/LeaseContainer'
import { Dashboard } from '../components/dashboard'
import { css, cx } from 'react-emotion'

class PropertiesCollection extends Collection<Property> {}
class UnitsCollection extends Collection<Unit> {}

const Units: SFC<RouteProps & { propertyId?: string }> = (props: any) => {
  const propertyId = props.match.params.propertyId!
  return (
    <UnitsCollection
      key={propertyId}
      authPath={`properties/${propertyId}/units`}
      transform={units =>
        units.sort((a, b) => collator.compare(a.address, b.address))
      }
      render={(units, hasLoaded) => {
        return (
          <>
            <ListHeader label="Units">
              {(modal, toggle) => (
                <NewUnitForm
                  propertyId={propertyId}
                  isModalOpen={modal}
                  toggleModal={toggle}
                />
              )}
            </ListHeader>

            <ListGroup flush className={unitsListWrapStyles}>
              {units.map(u => {
                return (
                  <ListGroupItem
                    action
                    key={u.id}
                    to={`/properties/${propertyId}/units/${u.id}`}
                    tag={Link}>
                    {u.address}
                  </ListGroupItem>
                )
              })}
              {hasLoaded && !units.length ? (
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
      authPath="properties"
      orderBy={{ field: 'name', direction: 'asc' }}
      render={properties => {
        console.log('render properties collection')
        return (
          <Dashboard
            leaseContainer={
              <Switch>
                <Route component={LeaseContainer} path="/properties" exact />
                <Route
                  render={({
                    match: {
                      params: { propertyId },
                    },
                  }: any) => <LeaseContainer propertyId={propertyId} />}
                  path="/properties/:propertyId"
                  exact
                />
                <Route
                  render={({
                    match: {
                      params: { propertyId, unitId },
                    },
                  }) => (
                    <LeaseContainer propertyId={propertyId} unitId={unitId} />
                  )}
                  path="/properties/:propertyId/units/:unitId"
                />
              </Switch>
            }
            sidebarItems={[
              <React.Fragment key="propertiesList">
                <ListHeader label="Properties">
                  {(modal, toggle) => (
                    <Modal isModalOpen={modal} toggle={toggle}>
                      Hello world
                    </Modal>
                  )}
                </ListHeader>
                <ListGroup className={propertiesListWrapStyles} flush>
                  {properties.map(p => {
                    return (
                      <ListGroupItem
                        action
                        key={p.id}
                        to={`/properties/${p.id}`}
                        tag={Link}>
                        {p.name}
                      </ListGroupItem>
                    )
                  })}
                </ListGroup>
              </React.Fragment>,
              <Route
                key="unitsList"
                component={Units}
                path="/properties/:propertyId"
              />,
            ]}
          />
        )
      }}
    />
  )
}

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
    display: block;
    .badge {
      cursor: pointer;
      float: right;
    }
  `,
)

const ListHeader: React.SFC<{
  label: string
  children: (modal: any, toggle: () => any) => any
}> = ({ children, label }) => {
  return (
    <Component
      initialState={{ modal: false }}
      render={({ setState, state: { modal } }: any) => (
        <h6 className={listHeaderStyles}>
          {label + ' '}
          <Badge
            onClick={() =>
              setState(({ modal: m }: any) => ({
                modal: !m,
              }))
            }
            color="secondary">
            New
          </Badge>
          {children(modal, () =>
            setState(({ modal }: any) => ({ modal: !modal })),
          )}
        </h6>
      )}
    />
  )
}

export default Properties
