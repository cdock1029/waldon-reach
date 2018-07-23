import React, { SFC } from 'react'
import { Collection } from '../components/FirestoreData'
import { Link, Router } from '@reach/router'
import Component from '@reactions/component'
import { ListGroup, ListGroupItem, Badge } from 'reactstrap'
import { isPartiallyActive } from '../lib/index'
import LeaseContainer from '../components/LeaseContainer'
import { auth } from '../lib/firebase'
import { css, cx } from 'react-emotion'
import NewTenantForm from '../components/NewTenantForm'

class TenantsCollection extends Collection<Tenant> {}

const Tenants: SFC<RouteProps> = () => {
  return (
    <TenantsCollection
      path={`companies/${auth.activeCompany}/tenants`}
      orderBy={{ field: 'lastName', direction: 'asc' }}
      render={(tenants, hasLoaded) => {
        if (!hasLoaded) {
          return null
        }
        if (!tenants.length) {
          return <h3>TODO no tenants</h3>
        }
        return (
          <div className={tenantsGridStyles}>
            <Router className={leaseSectionStyles}>
              <LeaseContainer path="/*" />
              <LeaseContainer path=":tenantId/*" />
            </Router>
            <div className={tenantsListSectionStyles}>
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
                      to={t.id}
                      tag={props => (
                        <Link
                          getProps={isPartiallyActive(props.className)}
                          {...props}
                        />
                      )}>
                      {`${t.lastName}, ${t.firstName}`}
                    </ListGroupItem>
                  )
                })}
              </ListGroup>
            </div>
          </div>
        )
      }}
    />
  )
}
const tenantsGridStyles = css({
  display: 'grid',
  gridTemplateAreas: `
    "tenants lease"
  ;`,
  gridTemplateColumns: '250px 1fr',
  gridTemplateRows: 'calc(100vh - var(--header-height))',
})
const tenantsListSectionStyles = css({
  gridArea: 'tenants',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
})
const tenantListWrapStyles = css`
  flex: 1;
  overflow-y: scroll;
`

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
