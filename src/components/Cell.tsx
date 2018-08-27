import React, { SFC } from 'react'
import styled from 'react-emotion'
import posed from 'react-pose'

interface CellProps {
  className?: string
  css?: any
  highlight?: boolean
}

const PoseCell = posed.div({
  normal: {
    fontSize: '1em',
    fontWeight: 400,
  },
  highlight: {
    fontSize: '1.2em',
    fontWeight: 600,
  },
})

/*const CurrencyCellStyled = styled(PoseCellWrap)`
  text-align: right;
  padding-right: 0.5em;
`*/

export const Cell: SFC<CellProps> = ({
  className,
  highlight = false,
  children,
}) => {
  return (
    <PoseCell className={className} pose={highlight ? 'highlight' : 'normal'}>
      {children}
    </PoseCell>
  )
}
