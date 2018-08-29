import React, { SFC } from 'react'
import styled from 'react-emotion'
import { Algolia } from './components/Algolia'
// import downshift from 'downshift'

const PageStyled = styled.div`
  display: flex;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2em;
`

const Page: SFC<{ path: string }> = () => {
  return (
    <PageStyled>
      <Algolia />
    </PageStyled>
  )
}

export default Page
