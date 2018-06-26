import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const config: any = {}
config.apiKey = process.env.REACT_APP_FIREBASE_API_KEY!
config.authDomain = process.env.REACT_APP_AUTH_DOMAIN!
config.databaseURL = process.env.REACT_APP_DATABASE_URL!
config.messagingSenderId = process.env.REACT_APP_MESSAGING_SENDER_ID!
config.projectId = process.env.REACT_APP_PROJECT_ID!
config.storageBucket = process.env.REACT_APP_STORAGE_BUCKET!

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
// export const updateCompany = () => activeCompany.updateCompanyOnAuth()

export { firestore as FirestoreTypes } from 'firebase/app'
