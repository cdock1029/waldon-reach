import React, { SFC } from 'react'
import { Collection } from '@comp/FirestoreData'
import { Link, Router } from '@reach/router'
import Component from '@reactions/component'
import {
  ListGroup,
  ListGroupItem,
  Badge,
  Card,
  CardBody,
  CardText,
  CardSubtitle,
} from 'reactstrap'
import { isPartiallyActive } from '@lib/index'
import LeaseContainer from '@comp/LeaseContainer'
import { Document } from '@comp/FirestoreData'
import { auth } from '@lib/firebase'
import { css, cx } from 'react-emotion'

class TenantsCollection extends Collection<Tenant> {}
class TenantDoc extends Document<Tenant> {}

const TenantDetail: SFC<RouteProps & { tenantId?: string }> = props => {
  return (
    <>
      <TenantDoc
        path={`companies/${auth.activeCompany}/tenants/${props.tenantId}`}
        render={tenant => (
          <div className={css({ padding: '1em' })}>
            <Card>
              <CardBody>
                <CardSubtitle>
                  {tenant && `${tenant.firstName} ${tenant.lastName}`}
                </CardSubtitle>
                <CardText>Tenant</CardText>
              </CardBody>
            </Card>
          </div>
        )}
      />
      {React.Children.map(props.children, child =>
        React.cloneElement(child as React.ReactElement<any>, {
          key: props.tenantId,
        }),
      )}
    </>
  )
}

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
            <div className={tenantsListSectionStyles}>
              <Component
                initialState={{ modal: false }}
                toggleCallback={({ modal }: any) => ({ modal: !modal })}
                render={({ setState, props: { toggleCallback } }: any) => (
                  <>
                    <h6 className={listHeaderStyles}>
                      Tenants{' '}
                      <Badge
                        color="secondary"
                        onClick={() => setState(toggleCallback)}>
                        New
                      </Badge>
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
            <div className={leaseSectionStyles}>
              <Router>
                <TenantDetail path=":tenantId">
                  <LeaseContainer path="/" />
                </TenantDetail>
              </Router>
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
  gridTemplateColumns: 'minmax(0, 250px) 1fr',
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
  overflow-y: scroll;
  label: LeaseGridArea;
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
