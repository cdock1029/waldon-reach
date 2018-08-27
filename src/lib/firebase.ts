import firebase, { firestore as Fs } from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import config from './firebaseConfig'

let _app: firebase.app.App
export const init = async () => {
  _app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config)
  _app.firestore().settings({ timestampsInSnapshots: true })
  try {
    await _app
      .firestore()
      .enablePersistence()
      .then(() => console.log('enabled!!'))
  } catch (e) {
    if (
      !e.message.includes('Firestore has already been started and persistence')
    ) {
      console.log({ e1: e })
    }
  }
}
export const app: () => firebase.app.App = () => _app
export const serverTimestamp = () =>
  firebase.firestore.FieldValue.serverTimestamp()

export const newDoc = async (collectionPath: string, data: Fs.DocumentData) => {
  if (app().auth().currentUser) {
    const activeCompany = getClaim('activeCompany')
    return app()
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

let _claims: { [key: string]: string } = {}
export function onAuthStateChangedWithClaims(
  claimsKeys: string[],
  callback: (
    user: firebase.User | null,
    claims: { [key: string]: string },
  ) => void,
) {
  return app()
    .auth()
    .onAuthStateChanged(async user => {
      let claims = {}
      if (user) {
        const token = await user.getIdTokenResult()
        claims = claimsKeys.reduce((acc, claim) => {
          acc[claim] = token.claims[claim]
          return acc
        }, claims)
      }
      _claims = claims
      callback(user, claims)
    })
}
export const getClaim = (key: string) => _claims[key]
