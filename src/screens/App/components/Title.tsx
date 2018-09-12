import React from 'react'
import { Text as RebassText } from 'rebass/emotion'

const Text = RebassText.withComponent('h1')
export const Title = (props: any) => (
  <Text {...props} mb={[4, 4, 5, 5]} fontSize={[4, 4, 5, 5]} />
)
