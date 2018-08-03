import functions, { EventContext } from 'firebase-functions'
import admin from 'firebase-admin'
import { format, getMonth, subMonths } from 'date-fns'

const serverTimeStamp = () => admin.firestore.FieldValue.serverTimestamp()
type Message = functions.pubsub.Message

const MONTHLY_LATE_FEE_RENT_JOBS = 'jobs/monthly-late-fee-rent-jobs/iterations'
const COMPANY_MLFR_JOBS = 'company-jobs'
const LEASE_MLFR_JOBS = 'lease-jobs'

// col            doc                 col         doc          col            col
// jobs/monthly-late-fee-rent-jobs/iterations/2018-08-03/company-jobs/cid/lease-jobs/lid

export const strictPubSubMonthlyLateFeesRent = async (
  message: Message,
): Promise<boolean> => {
  const compsRef = admin.firestore().collection('companies')
  const today = format(new Date(), 'YYYY-MM-dd')
  const jobRef = admin
    .firestore()
    .collection(MONTHLY_LATE_FEE_RENT_JOBS)
    .doc(today)

  const batch = admin.firestore().batch()

  batch.create(jobRef, { createdAt: serverTimeStamp(), done: false })
  const companies = await compsRef.get()

  companies.docs.forEach(companyDoc => {
    const companyJobRef = jobRef
      .collection(COMPANY_MLFR_JOBS)
      .doc(companyDoc.id)
    batch.create(companyJobRef, { done: false })
  })
  try {
    await batch.commit()
    console.log('pubsub monthly lf/rent batch (create company jobs) success')
    return true
  } catch (e) {
    console.log('Batch error:', e)
    return false
  }
}

// jobs/monthly-late-fee-rent-jobs/iterations/{day}/company-jobs/{companyId}
export const strictJobMonthlyLateFeesRentCompany = async (
  snap: DocSnap,
  context: EventContext,
): Promise<boolean> => {
  // get all active leases..
  // batch create lease jobs..

  const companyId = context.params.companyId
  const companyRef = admin
    .firestore()
    .collection('companies')
    .doc(companyId)
  const companyLeases = await companyRef
    .collection('leases')
    .where('status', '==', 'ACTIVE')
    .get()

  const companyJobRef = snap.ref
  const batch = admin.firestore().batch()

  companyLeases.docs.forEach(leaseDoc => {
    const leaseJobRef = companyJobRef.collection('lease-jobs').doc(leaseDoc.id)
    batch.create(leaseJobRef, { done: false })
  })
  try {
    await batch.commit()
    console.log('monthly lf/rent company batch (create lease jobs) success')
    return true
  } catch (e) {
    console.log('Batch error:', e)
    return false
  }
}

// jobs/monthly-late-fee-rent-jobs/iterations/{day}/company-jobs/{companyId}/lease-jobs/{leaseId}
export const strictJobMonthlyLateFeesRentLease = async (
  snap: DocSnap,
  context: EventContext,
): Promise<boolean> => {
  // individual lease calulation... look at balance, rent, late fee policy etc.
  const { day, companyId, leaseId } = context.params

  const leaseRef = admin
    .firestore()
    .collection(`companies/${companyId}/leases`)
    .doc(leaseId)

  const lease = await leaseRef.get()
  // if balance <= 0... i think we'er done...

  // else ... need to see if applied a late fee past month already.
  // get month of today .get last month. today's Month - 1.
  const lastMonth = subMonths(day, 1)
  const startLastMonth = new Date(
    lastMonth.getFullYear(),
    lastMonth.getMonth(),
    1,
  )

  const leaseTransactionsRef = leaseRef
    .collection('transactions')
    .where('date', '>=', startLastMonth)
    .where('date', '<', new Date(day))
    .where('TYPE', '==', 'LATE_FEE')

  const prevLateFees = await leaseTransactionsRef.get()

  const batch = admin.firestore().batch()

  try {
    await batch.commit()
    console.log('monthly lf/rent company batch (create lease jobs) success')
    return true
  } catch (e) {
    console.log('Batch error:', e)
    return false
  }
}
