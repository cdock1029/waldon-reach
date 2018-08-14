import { functions } from '../../deps'
import { index } from '../deps'
import { PROPERTY } from './deps'

export const onPropertyUpdated = functions.firestore
  .document(PROPERTY)
  .onUpdate(async (change, context) => {
    const data = { ...change.after.data(), objectID: change.after.id }
    try {
      await index().partialUpdateObject(data)
      return true
    } catch (e) {
      console.log(`Error updating Property=[${change.after.id}]: ${e.message}`)
      return false
    }
  })