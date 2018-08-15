import { functions } from '../../deps'
import { index } from '../algoliaDeps'
import { PROPERTY } from './deps'

export const onPropertyCreated = functions.firestore
  .document(PROPERTY)
  .onCreate(async (snap, context) => {
    const property = {
      objectID: snap.id,
      ...snap.data(),
      companyId: context.params.companyId,
    }
    try {
      await index().saveObject(property)
      return true
    } catch (e) {
      console.log(`Error saving Property=[${snap.id}] to algolia:`, e)
      return false
    }
  })
