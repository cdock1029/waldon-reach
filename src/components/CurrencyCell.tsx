import React, { SFC } from 'react'
import styled from 'react-emotion'
import Dinero from 'dinero.js'

interface CurrencyCellProps {
  amount: number
  format?: string
  formatNegative?: boolean
  className?: string
  css?: any
}

const CurrencyCellStyled = styled.div`
  /* display: flex;*/
  /* justify-content: flex-end;*/
  text-align: right;
  padding-right: 0.5em;
`

export const CurrencyCell: SFC<CurrencyCellProps> = ({
  amount,
  format = '$0,0.00',
  formatNegative = false,
  className,
}) => {
  const money: string = Dinero({ amount }).toFormat(format)
  return (
    <CurrencyCellStyled className={className}>
      {/* <span>$</span> */}
      <span>{`${formatNegative ? '-' : ''}${money}`}</span>
    </CurrencyCellStyled>
  )
}
