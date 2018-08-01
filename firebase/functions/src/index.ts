import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()
admin.firestore().settings({ timestampsInSnapshots: true })

function strictUnitCreateIncCount(
  unitSnap: DocSnap,
  context: Context,
): TransactionPromise {
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

function strictUnitDeleteDecCount(
  unitSnap: DocSnap,
  context: Context,
): TransactionPromise {
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

export const unitCreateIncCount = functions.firestore
  .document('companies/{cid}/properties/{pid}/units/{uid}')
  .onCreate(strictUnitCreateIncCount)

export const unitDeleteDecCount = functions.firestore
  .document('companies/{cid}/properties/{pid}/units/{uid}')
  .onDelete(strictUnitDeleteDecCount)

// export const qbo = functions.https.onRequest((req, res) => {
//   const {app} = require('./qbo')
//   app(req, res)
// })
export const qbo = functions.https.onRequest(require('./qbo').app)

type DocSnap = FirebaseFirestore.DocumentSnapshot
type Context = functions.EventContext
type TransactionPromise = Promise<FirebaseFirestore.Transaction>
