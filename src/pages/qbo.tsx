import React from 'react'
import { Button } from 'reactstrap'
import { SharedValue } from '../components/SharedValue'
import { app } from '../lib/firebase'
// import 'firebase/functions'
const getAlgoliaSecuredKey = app()
  .functions()
  .httpsCallable('getAlgoliaSecuredKey')
declare const intuit: any
// css class: .intuitPlatformConnectButton

const AUTH_URL =
  'https://us-central1-wpmfirebaseproject.cloudfunctions.net/qbo/auth/hello'

class QboInternal extends React.Component<
  {},
  {
    authCheck: { value: string; loading: boolean; time: string }
    algoliaKey: { value: string; loading: boolean; time: string }
    pageLoaded: boolean
  }
> {
  state = {
    pageLoaded: false,
    authCheck: { value: '', loading: false, time: '' },
    algoliaKey: { value: '', loading: false, time: '' },
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
        this.setState(() => ({ pageLoaded: true }))
      }
      document.head.appendChild(qboScript)
    } else {
      console.log('qbo script already in DOM')
      this.setState(() => ({ pageLoaded: true }))
    }
  }
  handleConnectClick = () => {
    intuit.ipp.anywhere.controller.onConnectToIntuitClicked()
  }
  handleAuthFunc = () => {
    this.setState(() => ({
      authCheck: { value: '', loading: true, time: '' },
    }))
    app()
      .auth()
      .currentUser!.getIdToken()
      .then(token => {
        const t0 = performance.now()
        fetch(AUTH_URL, {
          method: 'GET',
          headers: new Headers({ Authorization: `Bearer ${token}` }),
        })
          .then(res => res.text())
          .then(text => {
            const t1 = performance.now()
            this.setState(() => ({
              authCheck: {
                value: text,
                loading: false,
                time: `${(t1 - t0).toFixed(1)} ms`,
              },
            }))
          })
          .catch(e => {
            console.error(e)
            this.setState(({ authCheck }) => ({
              authCheck: { ...authCheck, value: e.message, loading: false },
            }))
          })
      })
  }
  handleCallable = async () => {
    this.setState(() => ({
      algoliaKey: { value: '', loading: true, time: '' },
    }))
    const t0 = performance.now()
    try {
      const result = await getAlgoliaSecuredKey()
      const t1 = performance.now()
      this.setState(() => ({
        algoliaKey: {
          value: result.data.key,
          loading: false,
          time: `${(t1 - t0).toFixed(1)} ms`,
        },
      }))
    } catch (e) {
      console.log('*ERROR*:', e)
    }
  }
  render() {
    const { pageLoaded, authCheck, algoliaKey } = this.state
    return (
      <div
        css={`
          height: 100%;
          overflow-y: scroll;
          padding: 2em;
          padding-top: 60px;
        `}>
        <p>Qbo connect</p>
        {pageLoaded ? (
          <Button color="primary" onClick={this.handleConnectClick}>
            Connect to Quickbooks
          </Button>
        ) : (
          <h4>Loading...</h4>
        )}
        <div css={'padding: 2em'}>
          <button onClick={this.handleAuthFunc}>Auth check</button>
          {authCheck.loading ? (
            <h5>Loading...</h5>
          ) : (
            <div>
              <p>Message: {authCheck.value}</p>
              <p>time: {authCheck.time}</p>
            </div>
          )}
        </div>
        <br />
        <div>
          <SharedValue<boolean> storageKey="qboBool">
            {({ value, set }) => {
              console.log({ value1: value })
              return (
                <div
                  css={
                    'display: flex; flex-direction: column; margin-botton: 1em;'
                  }>
                  <label>Boolean 1: {String(value)}</label>
                  <button onClick={() => set(!value)}>Toggle</button>
                </div>
              )
            }}
          </SharedValue>
        </div>
        <div>
          <SharedValue<boolean> storageKey="qboBool">
            {({ value, set }) => {
              console.log({ value2: value })
              return (
                <div
                  css={
                    'display: flex; flex-direction: column; margin-botton: 1em;'
                  }>
                  <label>Boolean 2: {String(value)}</label>
                  <button onClick={() => set(!value)}>Toggle</button>
                </div>
              )
            }}
          </SharedValue>
        </div>
        <br />
        <div>
          <label>Callable</label>
          {algoliaKey.loading ? (
            <h2>Loading....</h2>
          ) : (
            <div>
              <p>Value: {algoliaKey.value}</p>
              <p>time: {algoliaKey.time}</p>
            </div>
          )}
          <button onClick={this.handleCallable}>Get Algolia Key</button>
        </div>
      </div>
    )
  }
}

class QboErrorBoundary extends React.Component {
  state: any = {
    error: null,
    errorInfo: null,
  }
  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ error, errorInfo })
  }
  render() {
    const { error, errorInfo } = this.state
    if (error) {
      console.log({ error })
      return (
        <div>
          <pre>
            There was an error:
            {error.toString()}
            {errorInfo.componentStack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export const Qbo = () => (
  <QboErrorBoundary>
    <QboInternal />
  </QboErrorBoundary>
)
