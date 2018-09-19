import { user } from 'rxfire/auth'
import { collectionData, docData } from 'rxfire/firestore'
import { Subscription, Observable, of } from 'rxjs'
import { startWith, delay } from 'rxjs/operators'
import LRU from 'lru-cache'

const msg = 'Another tab has exclusive access to the persistence layer'
export function init() {
  const fb: any = firebase
  return fb
    .firestore()
    .enablePersistence({ experimentalTabSynchronization: false })
    .then(() => {
      console.log('enabled!!')
    })
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
const cache = LRU<string, () => void>({
  max: 20,
  dispose: (key, unsub) => {
    console.log('purging:', key)
    unsub()
  },
})
function noOp() {}
function saveRef(
  str: string,
  r: firebase.firestore.Query | firebase.firestore.DocumentReference,
) {
  if (!cache.has(str)) {
    // console.log('adding', str)
    cache.set(str, (r as any).onSnapshot(noOp))
  } /*else {
    console.log('cache hit!', str)
  }*/
}

function getRef(path: string): [firebase.firestore.Query, string] {
  let fixedPath: string
  if (path.charAt(0) === '/') {
    fixedPath = path
  } else {
    fixedPath = `companies/${getClaim('activeCompany')}/${path}`
  }
  return [firebase.firestore().collection(fixedPath), fixedPath]
}

export function authCollection<T>(
  path: string,
  options?: {
    orderBy?: OrderByTuple
    where?: WhereTuple[]
    // limit, startAfter, ...etc
  },
): Observable<T[]> {
  let [ref, fixedPath] = getRef(path)
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
  const serialStr = JSON.stringify({ fixedPath, options })
  saveRef(serialStr, ref)

  return collectionData<T>(ref, 'id')
}
export function authDoc<T>(path: string): Observable<T> {
  let checkPath: string
  if (path.charAt(0) === '/') {
    checkPath = path
  } else {
    checkPath = `companies/${getClaim('activeCompany')}/${path}`
  }
  const ref = firebase.firestore().doc(checkPath)
  const serialStr = JSON.stringify({ checkPath })
  saveRef(serialStr, ref)
  return docData<T>(ref, 'id')
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
