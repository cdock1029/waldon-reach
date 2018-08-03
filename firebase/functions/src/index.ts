import functions, { EventContext } from 'firebase-functions'
import admin from 'firebase-admin'

admin.initializeApp()
admin.firestore().settings({ timestampsInSnapshots: true })

function strictUnitCreateIncCount(
  unitSnap: DocSnap,
  context: EventContext,
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
  context: EventContext,
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

export const qbo = functions.https.onRequest(require('./qbo').app)

export const pubSubMonthlyLateFeesRent = functions.pubsub
  .topic('monthly-late-fee-rent-job')
  .onPublish(require('./strictPubSubMonthlyLateFeesRent'))

// col            doc                 col         doc          col            col
// jobs/monthly-late-fee-rent-jobs/iterations/2018-08-03/company-jobs/cid/lease-jobs/lid

export const jobMonthlyLateFeesCompany = functions.firestore
  .document(
    'jobs/monthly-late-fee-rent-jobs/iterations/{day}/company-jobs/{companyId}',
  )
  .onCreate(require('./strictJobMonthlyLateFeesRentCompany'))
