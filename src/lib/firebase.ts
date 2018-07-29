import firebase, { firestore as Fs, auth as Au } from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import config from './firebaseConfig'
import { access } from 'fs'

// interface Firestore {
//   settings(param: {timestampsInSnapshots: boolean}) : void
//   collection(path: string): any
// }
// interface FirebaseApp {
//   firestore() : Firestore
// }
// interface Firebase {
//   apps: any[]
//   app(): FirebaseApp
//   initializeApp(config: object) : FirebaseApp
//   firestore() : Firestore
// }

// declare const firebase: any // Firebase

export const app: any /* FirebaseApp*/ = firebase.apps.length
  ? firebase.app()
  : firebase.initializeApp(config)
app.firestore().settings({ timestampsInSnapshots: true })

export const newDoc = async (collectionPath: string, data: Fs.DocumentData) => {
  if (auth.currentUser) {
    const activeCompany = await auth.activeCompany()
    return app
      .firestore()
      .collection(`companies/${activeCompany}/${collectionPath}`)
      .doc()
      .set(data)
  }
}

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

type Auth = Au.Auth & {
  activeCompany(): Promise<string | undefined>
}

export const auth: Auth = new Proxy(app.auth(), handler)
export const firestore = firebase.firestore()

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
// export { firestore as Fs, auth as Auth } from 'firebase'
// export { app as App } from 'firebase/app'

// export { appTypes, authTypes, fsTypes }
