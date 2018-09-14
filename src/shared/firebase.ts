import { user } from 'rxfire/auth'
import { collectionData } from 'rxfire/firestore'
// import { switchMap, map } from 'rxjs/operators'
import { Subscription, Observable } from 'rxjs'

const msg = 'Another tab has exclusive access to the persistence layer'
export function init() {
  return (firebase as any)
    .firestore()
    .enablePersistence({ experimentalTabSynchronization: false })
    .then(() => console.log('enabled!!'))
    .catch((e: Error) => {
      if (e.message.includes(msg)) {
        alert(
          'App running in multiple tabs. Please close 1 tab and refresh app for best performance.',
        )
      } else {
        console.log(e.message)
      }
    })
}
// export const app: () => firebase.app.App = () => firebase.app()
export const serverTimestamp = () =>
  (firebase.firestore as any).FieldValue.serverTimestamp()

export const newDoc = async (
  collectionPath: string,
  data: firebase.firestore.DocumentData,
) => {
  if (firebase.auth().currentUser) {
    const activeCompany = getClaim('activeCompany')
    return firebase
      .firestore()
      .collection(`companies/${activeCompany}/${collectionPath}`)
      .doc()
      .set({
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
  }
}

let claimsData: { [key: string]: string } = {}

export function authCollection<T>(
  path: string,
  options?: {
    orderBy?: OrderByTuple
    where?: WhereTuple[]
    // limit, startAfter, ...etc
  },
): Observable<T[]> {
  let ref: firebase.firestore.Query = firebase
    .firestore()
    .collection(`companies/${getClaim('activeCompany')}/${path}`)
  if (options) {
    const { where, orderBy } = options
    if (where) {
      for (const clause of where) {
        ref = ref.where(...clause)
      }
    }
    if (orderBy) {
      ref = ref.orderBy(...orderBy)
    }
  }
  return collectionData<T>(ref, 'id')
}

export function observeUser(
  callback: (u: firebase.User, c: any) => void,
  claimsKeys: string[],
): Subscription {
  return user(firebase.auth()).subscribe(async u => {
    const tempClaims: { [key: string]: any } = {}
    if (u) {
      const token = await u.getIdTokenResult()
      claimsData = claimsKeys.reduce((acc, claim) => {
        acc[claim] = token.claims[claim]
        return acc
      }, tempClaims)
    }
    claimsData = tempClaims
    callback(u, claimsData)
  })
}

export const getClaim = (key: string) => claimsData[key]
