import React from 'react'
import { Button } from 'reactstrap'

declare const intuit: any

// css class: .intuitPlatformConnectButton

export class Qbo extends React.Component {
  state = {
    loaded: false,
  }
  componentDidMount() {
    const qbo = document.getElementById('qbo')
    if (!qbo) {
      console.log('not found, building..')
      const qboScript = document.createElement('script')
      qboScript.id = 'qbo'
      qboScript.src =
        'https://appcenter.intuit.com/Content/IA/intuit.ipp.anywhere-1.3.7.js'
      qboScript.onload = () => {
        intuit.ipp.anywhere.setup({
          grantUrl:
            'https://us-central1-wpmfirebaseproject.cloudfunctions.net/qbo/requestToken',
          datasources: {
            quickbooks: true, // set to false if NOT using Quickbooks API
            payments: false, // set to true if using Payments API
          },
        })
        this.setState(() => ({ loaded: true }))
      }
      document.head.appendChild(qboScript)
    } else {
      console.log('qbo script already in DOM')
      this.setState(() => ({ loaded: true }))
    }
  }
  handleConnectClick = () => {
    intuit.ipp.anywhere.controller.onConnectToIntuitClicked()
  }
  render() {
    const { loaded } = this.state
    return (
      <div css={'padding: 2em; padding-top: 60px;'}>
        <p>Qbo connect</p>
        {loaded ? (
          <Button color="primary" onClick={this.handleConnectClick}>
            Connect to Quickbooks
          </Button>
        ) : (
          <h4>Loading...</h4>
        )}
      </div>
    )
  }
}
