import firebase, { firestore, app } from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const config: any = {}
config.apiKey = process.env.REACT_APP_FIREBASE_API_KEY!
config.authDomain = process.env.REACT_APP_AUTH_DOMAIN!
config.databaseURL = process.env.REACT_APP_DATABASE_URL!
config.messagingSenderId = process.env.REACT_APP_MESSAGING_SENDER_ID!
config.projectId = process.env.REACT_APP_PROJECT_ID!
config.storageBucket = process.env.REACT_APP_STORAGE_BUCKET!

let firebaseApp: app.App

if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(config)
}
firebase.firestore().settings({ timestampsInSnapshots: true })

export const newDoc = (
  collectionPath: string,
  data: firestore.DocumentData,
) => {
  return firebase
    .firestore()
    .collection(collectionPath)
    .doc()
    .set(data)
}

class ActiveCompany {
  private company: string
  constructor() {
    firebase.auth().onAuthStateChanged(async (user: firebase.User) => {
      if (user) {
        const result = await user.getIdTokenResult()
        if (!result.claims.activeCompany) {
          throw new Error('Unauthorized user')
        }
        this.company = result.claims.activeCompany
        // TODO: unset company? handle outside of here if undefined?
      }
    })
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
    return target[prop]
  },
}

type Auth = firebase.auth.Auth & {
  activeCompany: string
}
export const auth: Auth = new Proxy(firebase.auth(), handler)
export default firebaseApp!
