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

export default firebaseApp!
