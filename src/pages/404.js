import React from 'react'

export default () => {
  return (
    <div
      css={`
        height: 100vh;
        display: flex;
        align-items: center;
        .message {
          margin: 0 auto;
        }
      `}>
      <div className="message">
        <h1>404 not found</h1>
      </div>
    </div>
  )
}
