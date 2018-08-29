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

function applyCharge(balance: number, chargeAmount: number): number {
  const result = Dinero({ amount: balance }).add(
    Dinero({ amount: chargeAmount }),
  )
  return result.getAmount()
}

function applyPayment(balance: number, paymentAmount: number): number {
  const result = Dinero({ amount: balance }).subtract(
    Dinero({ amount: paymentAmount }),
  )
  return result.getAmount()
}

exports = module.exports = functions.firestore
  .document(
    'companies/{companyId}/leases/{leaseId}/transactions/{transactionId}',
  )
  .onUpdate(
    async ({ before, after }, context): Promise<boolean> => {
      const transactionAfter: Transaction = {
        id: after.id,
        ...after.data(),
      } as Transaction
      const transactionBefore: Transaction = {
        id: before.id,
        ...before.data(),
      } as Transaction

      const leaseRef = after.ref.parent.parent
      if (!leaseRef) {
        console.error(
          `Transaction update error: [${
            after.id
          }] does not have a parent Lease.`,
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
          const { amount: amountBefore } = transactionBefore
          const { amount: amountAfter } = transactionAfter

          const changeAmount = amountAfter - amountBefore
          const currentBalance = balance ? balance : 0
          let newBalance: number
          switch (transactionAfter.type) {
            case 'CHARGE':
              newBalance = applyCharge(currentBalance, changeAmount)
              break
            case 'PAYMENT':
              newBalance = applyPayment(currentBalance, changeAmount)
              break
            default:
              throw new Error(
                `unhandled Transaction update for type=[${
                  transactionAfter.type
                }] for id=${transactionAfter.id}`,
              )
          }
          trans.update(leaseRef, { balance: newBalance })
        })
        .then(() => {
          console.log('Transaction update committed.')
          return true
        })
        .catch(e => {
          console.log('Transaction update failed: ', e)
          return false
        })
    },
  )
