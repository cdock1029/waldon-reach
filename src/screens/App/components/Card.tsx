import React from 'react'
import { Card as RebassCard } from 'rebass/emotion'
import styled from 'react-emotion'

export const Card = styled((props: any) => (
  <RebassCard
    {...props}
    p={[2, 3, 3, 4]}
    bg={props.bg || '#fff'}
    mb={[2, 3, 3, 4]}
    borderRadius={[4, 4, 4, 6]}
  />
))({
  boxShadow: '0 1px 3px 0 #343a4533',
  // border: '1px solid rgba(0,0,0,.2)',
})
