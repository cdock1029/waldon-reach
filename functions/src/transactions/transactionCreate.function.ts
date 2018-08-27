import { admin, functions } from '../globalDeps'
import { firestore } from 'firebase-admin'
import { Dinero } from './transactionDeps'

Dinero.globalLocale = 'en-US'

interface Transaction {
  id: string
  amount: number
  type: 'PAYMENT' | 'CHARGE'
  subType?: 'LATE_FEE' | 'RENT' | string
  date: firestore.Timestamp
  error?: {
    exists: boolean
    message: string
  }
}
interface Lease {
  id: string
  balance: number
}

function addCharge(balance: number, chargeAmount: number): number {
  const result = Dinero({ amount: balance }).add(
    Dinero({ amount: chargeAmount }),
  )
  return result.getAmount()
}

function subtractPayment(balance: number, paymentAmount: number): number {
  const result = Dinero({ amount: balance }).subtract(
    Dinero({ amount: paymentAmount }),
  )
  return result.getAmount()
}

exports = module.exports = functions.firestore
  .document(
    'companies/{companyId}/leases/{leaseId}/transactions/{transactionId}',
  )
  .onCreate(
    async (snap, context): Promise<boolean> => {
      const transaction: Transaction = {
        id: snap.id,
        ...snap.data(),
      } as Transaction

      if (transaction.amount <= 0) {
        console.log(
          `Invalid transaction=[${transaction.id}] amount=[${
            transaction.amount
          }] (<= 0) Deleting..`,
        )
        await admin
          .firestore()
          .doc(snap.ref.path)
          .delete()
        return false
      }

      const leaseRef = snap.ref.parent.parent
      if (!leaseRef) {
        console.error(
          `Transaction error: [${snap.id}] does not have a parent Lease.`,
        )
        return false
      }

      return admin
        .firestore()
        .runTransaction(async trans => {
          const leaseSnap = await trans.get(leaseRef)
          const lease: Lease = {
            id: leaseSnap.id,
            ...leaseSnap.data(),
          } as Lease

          const { balance } = lease
          const { amount } = transaction

          let newBalance: number
          switch (transaction.type) {
            case 'CHARGE':
              newBalance = addCharge(balance, amount)
              break
            case 'PAYMENT':
              newBalance = subtractPayment(balance, amount)
              break
            default:
              throw new Error(
                `unhandled Transaction type=[${transaction.type}] for id=${
                  transaction.id
                }`,
              )
          }
          trans.update(leaseRef, { balance: newBalance })
        })
        .then(() => {
          console.log('Transaction committed.')
          return true
        })
        .catch(e => {
          console.log('Transaction failed: ', e)
          return false
        })
    },
  )
