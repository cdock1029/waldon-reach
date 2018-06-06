import firebase, { firestore, app } from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import config from './firebase-config'

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
