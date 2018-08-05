import * as functions from 'firebase-functions'
// import admin from 'firebase-admin'
import { Client, Index } from 'algoliasearch'
import { CallableContext /*, HttpsErrorType*/ } from './exportedTypes'

// tslint:disable-next-line:no-duplicate-imports
import {
  // EventContext,
  // Change,
  config as configTypes,
} from 'firebase-functions'

// import { app } from 'firebase-admin'

// const ALGOLIA_APP_ID = config.algolia.app_id
// const ALGOLIA_ADMIN_KEY = config.algolia.admin_key
// const ALGOLIA_SEARCH_KEY = config.algolia.search_key

let client: Client | undefined // = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
let index: Index | undefined
let config: configTypes.Config | undefined

function getClient(): Client {
  if (typeof client === 'undefined') {
    console.log('algolia client undefined')
    const algoliasearch: (
      id: string,
      key: string,
    ) => Client = require('algoliasearch')
    config = functions.config()
    client = algoliasearch(config.algolia.app_id, config.algolia.admin_key)
  }
  return client
}
function getIndex(): Index {
  if (!index) {
    const ALGOLIA_INDEX_NAME = 'wpm'
    const c = getClient()
    index = c.initIndex(ALGOLIA_INDEX_NAME)
  }
  return index
}
if (false) {
  console.log(getIndex.toString())
}

/*
export const onPropertyCreated = (
  functions: any,
  admin: app.App,
  config: configNamespace.Config,
) => {
  return functions.firestore
    .document('companies/{companyId}/properties/{propertyId}')
    .onCreaty(async (snap: DocSnap, context: EventContext) => {
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
    })
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
}*/

export const getAlgoliaSecuredKey = functions.https.onCall(
  (data: any, context: CallableContext): { key: string } => {
    context.rawRequest.socket.setKeepAlive(true)
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Function must be called while authenticated.',
      )
    }
    const activeCompany: string | undefined = context.auth.token.activeCompany
    if (!activeCompany) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Function must be called while authenticated.',
      )
    }
    const uid = context.auth.uid
    const params = {
      filters: `companyId:${activeCompany}`,
      userToken: uid,
    }
    const algoliaClient = getClient()
    const key = algoliaClient.generateSecuredApiKey(
      config!.algolia.search_key,
      params,
    )
    // todo: can we check if this exists on the user (since tied to activeCompany, if not loade here.. then save.)
    // admin.auth().setCustomUserClaims(uid, {searchKey: key})
    return { key }
  },
)
