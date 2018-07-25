import React, { SFC } from 'react'
import { Collection } from '../components/FirestoreData'
import { ListGroup, ListGroupItem } from 'reactstrap'
import LeaseContainer from '../components/LeaseContainer'
import { css } from 'react-emotion'
import NewTenantForm from '../components/NewTenantForm'
import { Dashboard } from '../components/dashboard'
import { Link, Switch, Route } from 'react-static'
import { ListHeader } from '../components/ListHeader'

class TenantsCollection extends Collection<Tenant> { }

const Tenants: SFC<RouteProps> = () => {
  return (
    <TenantsCollection
      authPath="tenants"
      orderBy={{ field: 'lastName', direction: 'asc' }}
      render={tenants => {
        return (
          <Dashboard
            leaseContainer={
              <Switch>
                <Route component={LeaseContainer} exact path="/tenants" />
                <Route
                  render={({
                    match: {
                      params: { tenantId },
                    },
                  }: any) => <LeaseContainer tenantId={tenantId} />}
                  path="/tenants/:tenantId"
                />
              </Switch>
            }
            sidebarItems={[
              <React.Fragment key="tenantsList">
                <ListHeader label="Tenants">
                  {(modal, toggle) => (
                    <NewTenantForm isModalOpen={modal} toggleModal={toggle} />
                  )}
                </ListHeader>
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

export default Tenants
