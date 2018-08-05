import admin from 'firebase-admin'

admin.initializeApp()
admin.firestore().settings({ timestampsInSnapshots: true })

function wasCalled(functionName: string): boolean {
  return (
    !process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName
  )
}

// export const pubSubMonthlyLateFeesRent = functions.pubsub
//   .topic('monthly-late-fee-rent-job')
//   .onPublish(require('./strictPubSubMonthlyLateFeesRent'))

// col            doc                 col         doc          col            col
// jobs/monthly-late-fee-rent-jobs/iterations/2018-08-03/company-jobs/cid/lease-jobs/lid

// export const jobMonthlyLateFeesCompany = functions.firestore
//   .document(
//     'jobs/monthly-late-fee-rent-jobs/iterations/{day}/company-jobs/{companyId}',
//   )
//   .onCreate(require('./strictJobMonthlyLateFeesRentCompany'))

// if (wasCalled('qbo')) {
//   exports.qbo = functions.https.onRequest((req, resp) =>
//     require('./qbo').expressApp(req, resp, config, admin),
//   )
// }

if (wasCalled('qbo')) {
  exports.qbo = require('./qbo')
}
if (wasCalled('getAlgoliaSecuredKey')) {
  exports.getAlgoliaSecuredKey = require('./aloglia').getAlgoliaSecuredKey
}

/*
if (wasCalled('onPropertyCreated')) {
  exports.onPropertyCreated = require('./algolia').onPropertyCreated(functions, admin, config)
}

if (wasCalled('onPropertyUpdated')) {
  exports.onPropertyUpdated = functions.firestore
    .document('companies/{companyId}/properties/{propertyId}')
    .onUpdate((change, context) =>
      require('./algolia').onPropertyUpdated(change, context, admin, config),
    )
}

if (wasCalled('onPropertyDeleted')) {
  exports.onPropertyDeleted = functions.firestore
    .document('companies/{companyId}/properties/{propertyId}')
    .onDelete((snap, context) =>
      require('./algolia').onPropertyDeleted(snap, context, admin, config),
    )
}

if (wasCalled('unitCreateIncCount')) {
  exports.unitCreateIncCount = functions.firestore
    .document('companies/{cid}/properties/{pid}/units/{uid}')
    .onCreate((snap, context) =>
      require('./aloglia').unitCreateIncCount(snap, context, admin, config),
    )
}

if (wasCalled('unitDeleteDecCount')) {
  exports.unitDeleteDecCount = functions.firestore
    .document('companies/{cid}/properties/{pid}/units/{uid}')
    .onDelete((snap, context) =>
      require('./aloglia').unitDeleteDecCount(snap, context, admin, config),
    )
}


*/
