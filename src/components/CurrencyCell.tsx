import React, { SFC } from 'react'
import styled from 'react-emotion'
import Dinero from 'dinero.js'
import { Cell } from './Cell'

interface CurrencyCellProps {
  amount: number
  format?: string
  formatNegative?: boolean
  className?: string
  css?: any
  highlight?: boolean
}

const CurrencyCellStyled = styled(Cell)`
  text-align: right;
  padding-right: 0.5em;
`

export const CurrencyCell: SFC<CurrencyCellProps> = ({
  amount,
  className,
  format = '$0,0.00',
  formatNegative = false,
  highlight = false,
}) => {
  const money: string = Dinero({ amount }).toFormat(format)
  return (
    <CurrencyCellStyled className={className} highlight={highlight}>
      <span>{`${formatNegative ? '-' : ''}${money}`}</span>
    </CurrencyCellStyled>
  )
}
