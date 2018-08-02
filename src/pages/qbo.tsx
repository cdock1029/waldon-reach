import React from 'react'
import { Button } from 'reactstrap'
import { auth } from '../lib/firebase'

declare const intuit: any

// css class: .intuitPlatformConnectButton

const AUTH_URL =
  'https://us-central1-wpmfirebaseproject.cloudfunctions.net/qbo/auth/hello'

export class Qbo extends React.Component {
  state = {
    loaded: false,
    message: '',
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
  handleAuthFunc = () => {
    auth!.currentUser!.getIdToken().then(token => {
      fetch(AUTH_URL, {
        method: 'GET',
        headers: new Headers({ Authorization: `Bearer ${token}` }),
      })
        .then(res => res.text())
        .then(text => this.setState(() => ({ message: text })))
        .catch(e => {
          console.error(e)
          this.setState(() => ({ message: e.message }))
        })
    })
  }
  render() {
    const { loaded, message } = this.state
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
        <div css={'padding: 2em'}>
          <button onClick={this.handleAuthFunc}>Auth check</button>
          <p>{message}</p>
        </div>
      </div>
    )
  }
}
