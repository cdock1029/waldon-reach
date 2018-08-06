import admin from 'firebase-admin'
// import { Request, Response } from 'firebase-functions'

admin.initializeApp()
admin.firestore().settings({ timestampsInSnapshots: true })

function wasCalled(functionName: string): boolean {
  return (
    !process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName
  )
}

if (wasCalled('pubSubMonthlyLateFeesRent')) {
  const monthlyJob = require('./monthly-job')
  exports.pubSubMonthlyLateFeesRent = monthlyJob.pubSubMonthlyLateFeesRent
  exports.jobMonthlyLateFeesCompany = monthlyJob.jobMonthlyLateFeesCompany
  exports.jobMonthlyLateFeesRentLease = monthlyJob.jobMonthlyLateFeesRentLease
}

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
