import React from 'react'
import algoliasearch from 'algoliasearch/lite'
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Highlight,
  CurrentRefinements,
  ClearRefinements,
} from 'react-instantsearch-dom'
import { getClaim } from '../../../../../shared/firebase'
import 'instantsearch.css/themes/reset.css'
import 'instantsearch.css/themes/algolia.css'

declare const firebase: FB

const ALGOLIA_APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID!

const getAlgoliaSecuredKey = firebase
  .functions()
  .httpsCallable('getAlgoliaSecuredKey')

interface AlgoliaState {
  clientLoaded: boolean
  error?: string
}
export class Algolia extends React.Component<object, AlgoliaState> {
  mounted: boolean
  searchClient: any
  state: AlgoliaState = {
    clientLoaded: false,
  }
  async componentDidMount() {
    this.mounted = true
    const claim = getClaim('algoliaSecuredApiKey')
    console.log({ claim })
    if (claim) {
      this.searchClient = algoliasearch(ALGOLIA_APP_ID, claim)
      this.setState(() => ({ clientLoaded: true, error: undefined }))
    } else {
      console.log('loading form server..')
      try {
        const { data } = await getAlgoliaSecuredKey()
        if (data.key) {
          firebase.auth().currentUser!.getIdToken(true)
          this.searchClient = algoliasearch(ALGOLIA_APP_ID, data.key)
          this.setState(() => ({ clientLoaded: true, error: undefined }))
        } else {
          this.setState(() => ({
            clientLoaded: true,
            error: 'Search not permitted at this time.',
          }))
        }
      } catch (e) {
        this.setState(() => ({ error: e.message }))
      }
    }
  }
  componentWillUnmount() {
    this.mounted = false
  }
  render() {
    const { clientLoaded, error } = this.state
    if (error) {
      return (
        <div>
          <h1>{error}</h1>
        </div>
      )
    }
    if (!clientLoaded) {
      return (
        <div>
          <h4>Loading...</h4>
        </div>
      )
    }
    return (
      <div>
        <InstantSearch indexName="wpm" searchClient={this.searchClient}>
          <CurrentRefinements />
          <ClearRefinements />
          <SearchBox />
          <RefinementList attribute="entity" />
          <div>
            <Hits hitComponent={Entity} />
          </div>
        </InstantSearch>
      </div>
    )
  }
}

const Entity = ({ hit }: any) => {
  return (
    <div>
      <label>
        <b>{hit.entity}</b>
      </label>
      <br />
      {(() => {
        let attribute = ''
        switch (hit.entity) {
          case 'property':
          case 'company':
            attribute = 'name'
            break
          case 'unit':
            attribute = 'label'
            break
          case 'lease':
            attribute = 'rent'
            break
          case 'tenant':
            attribute = 'name'
            break
          default:
            return JSON.stringify(hit)
        }
        return (
          <div>
            <Highlight attribute={attribute} hit={hit} tagName="mark" />
          </div>
        )
      })()}
    </div>
  )
}
