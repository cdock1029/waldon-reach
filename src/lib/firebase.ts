import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import config from './firebaseConfig'

// declare const firebase: any

export const app = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(config)
firebase.firestore().settings({ timestampsInSnapshots: true })

export const newDoc = (
  collectionPath: string,
  data: firebase.firestore.DocumentData,
) => {
  return firebase
    .firestore()
    .collection(collectionPath)
    .doc()
    .set(data)
}

class ActiveCompany {
  private company: string
  updateCompanyOnAuth = async () => {
    const user = firebase.auth().currentUser
    if (user) {
      const result = await user.getIdTokenResult()
      if (!result.claims.activeCompany) {
        // if (true) {
        return Promise.reject('Unauthorized user')
      }
      this.company = result.claims.activeCompany
      return Promise.resolve()
    } else {
      this.company = ''
      return Promise.resolve()
    }
  }
  get value() {
    return this.company
  }
}
const activeCompany = new ActiveCompany()
const handler = {
  get(target: any, prop: string) {
    if (prop === 'activeCompany') {
      return activeCompany.value
    }
    if (prop === 'updateCompany') {
      return activeCompany.updateCompanyOnAuth
    }
    return target[prop]
  },
}

type Auth = firebase.auth.Auth & {
  activeCompany: string
  updateCompany: () => Promise<void>
}
export const auth: Auth = new Proxy(firebase.auth(), handler)
export const firestore = firebase.firestore()

export interface AuthWithClaims {
  user: firebase.User | null
  claims: { [key: string]: string | undefined }
}
export function onAuthStateChangedWithClaims(
  claimsKeys: string[],
  callback: (
    result: { user: firebase.User | null; claims: { [key: string]: string } },
  ) => any,
) {
  return auth.onAuthStateChanged(async user => {
    let claims = {}
    if (user) {
      const token = await user.getIdTokenResult()
      claims = claimsKeys.reduce((acc, claim) => {
        acc[claim] = token.claims[claim]
        return acc
      }, claims)
    }
    callback({ user, claims })
  })
}
// export const updateCompany = () => activeCompany.updateCompanyOnAuth()

export { firestore as FirestoreTypes } from 'firebase/app'
