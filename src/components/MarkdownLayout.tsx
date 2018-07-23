import React, { SFC } from 'react'
import styled from 'react-emotion'

export const MarkdownLayout: SFC = props => (
  <Background>
    <div className="content" css={{ color: 'red' }}>
      {props.children}
    </div>
  </Background>
)

const Background = styled('div')`
  padding: 2em;
  background-color: #efefef;
  display: flex;
  flex-direction: column;
  height: 100%;
  .content {
    flex: 1;
    padding: 1em;
    background-color: #fff;
  }
`
