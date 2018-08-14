import algoliaSearchDep, { Index } from 'algoliasearch'
import { config } from '../deps'

export const algoliasearch = algoliaSearchDep
export const client = algoliasearch(
  config.algolia.app_id,
  config.algolia.admin_key,
)

let _index: Index | undefined
export function index(): Index {
  if (!_index) {
    _index = client.initIndex('wpm')
  }
  return _index
}
