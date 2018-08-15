import React from 'react'
import styled from 'react-emotion'
import { Algolia } from '../lib/algolia'
// import downshift from 'downshift'

const Page = styled.div`
  display: flex;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2em;
`

export default () => {
  return (
    <Page>
      <Algolia />
    </Page>
  )
}
