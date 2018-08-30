import DineroJS from 'dinero.js'
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

// export function loadLeaseAndTransaction(
//   fsTrans: FirebaseFirestore.Transaction,
//   leaseRef: fs.DocumentReference,
//   transactionRef: fs.DocumentReference,
// ): Promise<[Lease, Transaction]> {
//   const leasePromise = fsTrans
//     .get(leaseRef)
//     .then(snap => ({ id: snap.id, ...snap.data() } as Lease))
//   const transactionPromise = fsTrans
//     .get(transactionRef)
//     .then(snap => ({ id: snap.id, ...snap.data() } as Transaction))
//   return Promise.all([leasePromise, transactionPromise])
// }
