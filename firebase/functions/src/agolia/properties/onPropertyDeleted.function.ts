import { functions } from '../../deps'
import { index } from '../deps'
import { PROPERTY } from './deps'

export const onPropertyDeleted = functions.firestore
  .document(PROPERTY)
  .onDelete(async (snap, context) => {
    try {
      await index().deleteObject(snap.id)
      return true
    } catch (e) {
      console.error(
        `Error deleting Property=[${snap.id}] on algolia: ${e.message}`,
      )
      return false
    }
  })
