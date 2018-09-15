import DineroJS from 'dinero.js'
import { getClaim } from '../../../../../shared/firebase'

export const Dinero = DineroJS

Dinero.globalLocale = 'en-US'

export function addToBalance(balance: number, amount: number): number {
  const result = Dinero({ amount: balance }).add(Dinero({ amount }))
  return result.getAmount()
}

export function subtractFromBalance(balance: number, amount: number): number {
  const result = Dinero({ amount: balance }).subtract(Dinero({ amount }))
  return result.getAmount()
}

export function createTransaction(
  transaction: NewTransactionFormState,
  leaseId: string,
) {
  const leaseRef = firebase
    .firestore()
    .doc(`companies/${getClaim('activeCompany')}/leases/${leaseId}`)
  const transactionRef = leaseRef.collection('transactions').doc()
  return firebase.firestore().runTransaction(async trans => {
    const leaseSnap = await trans.get(leaseRef)
    const { balance } = { ...leaseSnap.data() } as Lease
    let newBalance: number
    const { amount } = transaction
    switch (transaction.type) {
      // increase balance
      case 'CHARGE':
        newBalance = addToBalance(balance, amount)
        break
      // decrease balance
      case 'PAYMENT':
        newBalance = subtractFromBalance(balance, amount)
        break
      default:
        throw new Error(`Unhandled Transaction type=[${transaction.type}]`)
    }
    trans.set(transactionRef, transaction)
    trans.update(leaseRef, { balance: newBalance })
  })
}
