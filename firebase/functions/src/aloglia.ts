import algoliasearch, { Client, Index } from 'algoliasearch'
import {
  EventContext,
  Change,
  config as configNamespace,
} from 'firebase-functions'
import { app } from 'firebase-admin'
import { CallableContext, HttpsErrorType } from './exportedTypes'

// const ALGOLIA_APP_ID = config.algolia.app_id
// const ALGOLIA_ADMIN_KEY = config.algolia.admin_key
// const ALGOLIA_SEARCH_KEY = config.algolia.search_key

const ALGOLIA_INDEX_NAME = 'wpm'
let client: Client | undefined // = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
let index: Index | undefined

function getClient(config: configNamespace.Config): Client {
  if (!client) {
    client = algoliasearch(config.algolia.app_id, config.algolia.admin_key)
  }
  return client
}
function getIndex(config: configNamespace.Config): Index {
  if (!index) {
    const c = getClient(config)
    index = c.initIndex(ALGOLIA_INDEX_NAME)
  }
  return index
}

export const onPropertyCreated = async (
  snap: DocSnap,
  context: EventContext,
  admin: app.App,
  config: configNamespace.Config,
) => {
  const property = {
    objectID: snap.id,
    ...snap.data(),
    companyId: context.params.companyId,
  }

  try {
    await getIndex(config).saveObject(property)
    return true
  } catch (e) {
    console.log(`Error saving Property=[${snap.id}] to algolia:`, e)
    return false
  }
}

export const onPropertyDeleted = async (
  snap: DocSnap,
  context: EventContext,
  admin: app.App,
  config: configNamespace.Config,
) => {
  try {
    await getIndex(config).deleteObject(snap.id)
    return true
  } catch (e) {
    console.error(
      `Error deleting Property=[${snap.id}] on algolia: ${e.message}`,
    )
    return false
  }
}

export const onPropertyUpdated = async (
  change: Change<DocSnap>,
  context: EventContext,
  admin: app.App,
  config: configNamespace.Config,
) => {
  const data = { objectID: change.after.id, ...change.after.data() }
  try {
    await getIndex(config).partialUpdateObject(data)
    return true
  } catch (e) {
    console.log(`Error updating Property=[${change.after.id}]: ${e.message}`)
    return false
  }
}

export const unitCreateIncCount = (
  unitSnap: DocSnap,
  context: EventContext,
  admin: app.App,
): TransactionPromise => {
  // unitSnap -> unit collection -> property doc
  const propertyRef = unitSnap.ref.parent.parent

  return admin.firestore().runTransaction(async trans => {
    const propertyDoc = await trans.get(propertyRef!)
    if (!propertyDoc.exists) {
      throw new Error('Parent Property doc does not exist')
    }
    const data = propertyDoc.data()
    const unitCount = ((data && data.unitCount) || 0) + 1
    return trans.update(propertyRef!, { unitCount })
  })
}

export const unitDeleteDecCount = (
  unitSnap: DocSnap,
  context: EventContext,
  admin: app.App,
  config: configNamespace.Config,
): TransactionPromise => {
  // unitSnap -> unit collection -> property doc
  const propertyRef = unitSnap.ref.parent.parent

  return admin.firestore().runTransaction(async trans => {
    const propertyDoc = await trans.get(propertyRef!)
    if (!propertyDoc.exists) {
      throw new Error('Parent Property doc does not exist')
    }
    const unitCount = propertyDoc.data()!.unitCount - 1
    return trans.update(propertyRef!, { unitCount })
  })
}

export const getAlgoliaSecuredKey = (
  data: any,
  context: CallableContext,
  config: configNamespace.Config,
  HttpsError: HttpsErrorType,
): { key: string } => {
  if (!context.auth) {
    throw new HttpsError(
      'failed-precondition',
      'Function must be called while authenticated.',
    )
  }
  const activeCompany: string | undefined = context.auth.token.activeCompany
  if (!activeCompany) {
    throw new HttpsError(
      'permission-denied',
      'Function must be called while authenticated.',
    )
  }
  const uid = context.auth.uid
  const params = {
    filters: `companyId:${activeCompany}`,
    userToken: uid,
  }
  const key = getClient(config).generateSecuredApiKey(
    config.algolia.search_key,
    params,
  )
  return { key }
}
