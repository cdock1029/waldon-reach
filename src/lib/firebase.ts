// import firebase from 'firebase/app'
// import 'firebase/auth'
// import 'firebase/firestore'
import config from './firebaseConfig'

declare const firebase: any

export const app = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(config)
firebase.firestore().settings({ timestampsInSnapshots: true })

export const newDoc = async (
  collectionPath: string,
  data: firebase.firestore.DocumentData,
) => {
  if (auth.currentUser) {
    const result = await auth.currentUser.getIdTokenResult()
    return firebase
      .firestore()
      .collection(`companies/${result.claims.activeCompany}/${collectionPath}`)
      .doc()
      .set(data)
  }
}

// class ActiveCompany {
//   constructor() {
//     firebase.auth().onAuthStateChanged(async user => {
//       if (user) {
//         const result = await user.getIdTokenResult()
//         this.company = result.claims.activeCompany
//       } else {
//         this.company = undefined
//       }
//     })
//   }
//   get value() {
//     return this.company
//   }
// }
const activeCompany = async () => {
  if (!auth.currentUser) {
    return undefined
  }
  const token = await auth.currentUser.getIdTokenResult()
  return token.claims.activeCompany
}
const handler = {
  get(target: any, prop: string) {
    if (prop === 'activeCompany') {
      return activeCompany
    }
    return target[prop]
  },
}

type Auth = firebase.auth.Auth & {
  activeCompany(): Promise<string | undefined>
}
export const auth: Auth = new Proxy(firebase.auth(), handler)
export const firestore: firebase.firestore.Firestore = firebase.firestore()

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
