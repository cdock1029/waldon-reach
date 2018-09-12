import React from 'react'
import { Box as RebassBox } from 'rebass/emotion'

const Box = RebassBox.withComponent('section')
export const Section = (props: any) => <Box {...props} mb="2.5em" />
