import React, { SFC } from 'react'
import styled from 'react-emotion'
import Dinero from 'dinero.js'

interface CurrencyCellProps {
  amount: number
  format?: string
}

const CurrencyCellStyled = styled.div`
  /* display: flex;*/
  /* justify-content: flex-end;*/
  text-align: right;
`

export const CurrencyCell: SFC<CurrencyCellProps> = ({
  amount,
  format = '0,0.00',
}) => {
  const money: string = Dinero({ amount }).toFormat(format)
  return (
    <CurrencyCellStyled>
      {/* <span>$</span> */}
      <span>{money}</span>
    </CurrencyCellStyled>
  )
}
