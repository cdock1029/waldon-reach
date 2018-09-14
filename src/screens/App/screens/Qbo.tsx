import React, { SFC } from 'react'
import { Button } from 'reactstrap'
import { Card } from '../components/Card'
import { Title } from '../components/Title'
import { Section } from '../components/Section'
import { Container } from '../components/Container'

declare const firebase: FB

const getAlgoliaSecuredKey = firebase
  .functions()
  .httpsCallable('getAlgoliaSecuredKey')

const uploadAllDataFunction = firebase
  .functions()
  .httpsCallable('uploadAllData')

declare const intuit: any

const root =
  process.env.NODE_ENV === 'production'
    ? 'https://us-central1-wpmfirebaseproject.cloudfunctions.net'
    : 'http://localhost:5000/wpmfirebaseproject/us-central1'
const AUTH_URL = `${root}/qbo/hello`

console.log({ env: process.env.NODE_ENV, root, AUTH_URL })

class QboInternal extends React.Component<
  {},
  {
    authCheck: { value: string; loading: boolean; time: string }
    algoliaKey: { value: string; loading: boolean; time: string }
    uploadAllData: { value: string; loading: boolean; time: string }
    pageLoaded: boolean
  }
> {
  state = {
    pageLoaded: false,
    authCheck: { value: '', loading: false, time: '' },
    algoliaKey: { value: '', loading: false, time: '' },
    uploadAllData: { value: '', loading: false, time: '' },
  }
  componentDidMount() {
    console.log('componentDidMount qbo')
    const qbo = document.getElementById('qbo')
    if (!qbo) {
      console.log('not found, building..')
      const qboScript = document.createElement('script')
      qboScript.id = 'qbo'
      qboScript.src =
        'https://appcenter.intuit.com/Content/IA/intuit.ipp.anywhere-1.3.7.js'
      qboScript.onload = () => {
        intuit.ipp.anywhere.setup({
          grantUrl: `${root}/qbo/requestToken`,
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
    firebase
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
  handleUploadClick = async () => {
    this.setState(() => ({
      uploadAllData: { value: '', loading: true, time: '' },
    }))
    const t0 = performance.now()
    try {
      const result = await uploadAllDataFunction()
      const t1 = performance.now()
      this.setState(() => ({
        uploadAllData: {
          value: JSON.stringify(result.data, null, 2),
          loading: false,
          time: `${(t1 - t0).toFixed(1)} ms`,
        },
      }))
    } catch (e) {
      console.log('*ERROR*:', e)
    }
  }
  render() {
    const { pageLoaded, authCheck, algoliaKey, uploadAllData } = this.state
    console.log('render qbo:', {
      pageLoaded,
      authCheck,
      algoliaKey,
      uploadAllData,
    })
    return (
      <Container mt="49px">
        <Section>
          <Title>Regular Card</Title>
          <Card>
            <div>This is some text inside the card.</div>
          </Card>
        </Section>

        <Section>
          <Title>Green Card</Title>
          <Card bg="green">
            <div>This is some text inside the card.</div>
          </Card>
        </Section>

        <Section>
          <Title>Red Card</Title>
          <Card bg="red">
            <div>This is some text inside the card.</div>
          </Card>
        </Section>
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
        <br />
        <h3>Upload data to algolia</h3>
        <div>
          {uploadAllData.loading ? (
            <h5>Uploading now...</h5>
          ) : (
            <div>
              <p>Response:</p>
              <pre> {uploadAllData.value}</pre>
              <p>time: {uploadAllData.time}</p>
            </div>
          )}
          <div>
            <button onClick={this.handleUploadClick}>Start upload</button>
          </div>
        </div>
      </Container>
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

const Qbo: SFC<{ path: string }> = () => (
  <QboErrorBoundary>
    <QboInternal />
  </QboErrorBoundary>
)

export default Qbo
