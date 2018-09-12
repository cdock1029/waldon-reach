import React from 'react'
import { Box } from 'rebass/emotion'
import styled from 'react-emotion'

export const Container = styled((props: any) => (
  <Box {...props} p={[2, 3, 4, 5]} />
))`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: scroll;
`
