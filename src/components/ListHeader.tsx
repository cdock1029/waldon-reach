import React, { Fragment } from 'react'
import { Badge } from 'reactstrap'
import { css, cx } from 'react-emotion'
import { BooleanValue } from 'react-values'

export const ListHeader: React.SFC<{
  label: string
  children: JSX.Element
  disabled?: boolean
  color?: string
  className?: string
  css?: any
}> = ({ children, label, disabled, className }) => {
  return (
    <h6 className={cx('bg-light', listHeaderStyles, className)}>
      {label}
      <BooleanValue>
        {({ value, toggle }: { value: boolean; toggle(): any }) => (
          <Fragment>
            {!disabled && <Badge onClick={toggle}>New</Badge>}
            {React.cloneElement(React.Children.only(children), {
              isModalOpen: value,
              toggleModal: toggle,
            })}
          </Fragment>
        )}
      </BooleanValue>
    </h6>
  )
}
ListHeader.defaultProps = { disabled: false }

const listHeaderStyles = css`
  padding: 0.5em;
  margin: 0;
  display: block;
  .badge {
    cursor: pointer;
    float: right;
  }
`
