import React from 'react'
import Component from '@reactions/component'
import { Badge } from 'reactstrap'
import { css, cx } from 'react-emotion'

export const ListHeader: React.SFC<{
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
