import React, { SFC } from 'react'
import { Collection } from '../components/FirestoreData'
import Component from '@reactions/component'
import { ListGroup, ListGroupItem, Badge } from 'reactstrap'
import { isPartiallyActive } from '../lib/index'
import LeaseContainer from '../components/LeaseContainer'
import { css, cx } from 'react-emotion'
import NewTenantForm from '../components/NewTenantForm'
import { Dashboard } from '../components/dashboard'
import { Link, Switch, Route } from 'react-static'

class TenantsCollection extends Collection<Tenant> {}

const getAuthPath = (claims: any) => `companies/${claims.activeCompany}/tenants`
const Tenants: SFC<RouteProps> = () => {
  return (
    <TenantsCollection
      authPath={getAuthPath}
      orderBy={{ field: 'lastName', direction: 'asc' }}
      render={tenants => {
        return (
          <Dashboard
            leaseContainer={
              <Switch>
                <Route component={LeaseContainer} exact path="/tenants" />
                <Route component={LeaseContainer} path="/tenants/:tenantId" />
              </Switch>
            }
            sidebarItems={[
              <React.Fragment key="tenantsList">
                <Component
                  initialState={{ modal: false }}
                  toggleCallback={({ modal }: any) => ({ modal: !modal })}
                  render={({
                    setState,
                    state: { modal },
                    props: { toggleCallback },
                  }: any) => (
                    <>
                      <h6 className={listHeaderStyles}>
                        Tenants{' '}
                        <Badge
                          color="secondary"
                          onClick={() => setState(toggleCallback)}>
                          New
                        </Badge>
                        <NewTenantForm
                          isModalOpen={modal}
                          toggleModal={() =>
                            setState(({ modal: m }: any) => ({
                              modal: !m,
                            }))
                          }
                        />
                      </h6>
                    </>
                  )}
                />
                <ListGroup className={tenantListWrapStyles} flush>
                  {tenants.map(t => {
                    return (
                      <ListGroupItem
                        className={css`
                          &.list-group-item.list-group-item-action.active {
                            color: #fff;
                            background-color: #0c5460;
                            border-color: #0c5460;
                          }
                        `}
                        action
                        key={t.id}
                        to={`/tenants/${t.id}`}
                        tag={props => (
                          <Link activeClassName="active" {...props} />
                        )}>
                        {`${t.lastName}, ${t.firstName}`}
                      </ListGroupItem>
                    )
                  })}
                </ListGroup>
              </React.Fragment>,
              <React.Fragment key="tenantsList2">
                <Component
                  initialState={{ modal: false }}
                  toggleCallback={({ modal }: any) => ({ modal: !modal })}
                  render={({
                    setState,
                    state: { modal },
                    props: { toggleCallback },
                  }: any) => (
                    <>
                      <h6 className={listHeaderStyles}>
                        Tenants{' '}
                        <Badge
                          color="secondary"
                          onClick={() => setState(toggleCallback)}>
                          New
                        </Badge>
                        <NewTenantForm
                          isModalOpen={modal}
                          toggleModal={() =>
                            setState(({ modal: m }: any) => ({
                              modal: !m,
                            }))
                          }
                        />
                      </h6>
                    </>
                  )}
                />
                <ListGroup className={tenantListWrapStyles} flush>
                  {tenants.map(t => {
                    return (
                      <ListGroupItem
                        className={css`
                          &.list-group-item.list-group-item-action.active {
                            color: #fff;
                            background-color: #0c5460;
                            border-color: #0c5460;
                          }
                        `}
                        action
                        key={t.id}
                        to={`/tenants/${t.id}`}
                        tag={props => (
                          <Link activeClassName="active" {...props} />
                        )}>
                        {`${t.lastName}, ${t.firstName}`}
                      </ListGroupItem>
                    )
                  })}
                </ListGroup>
              </React.Fragment>,
            ]}
          />
        )
      }}
    />
  )
}
const tenantListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
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

export default Tenants
