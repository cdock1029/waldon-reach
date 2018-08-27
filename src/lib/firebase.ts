import config from './firebaseConfig'

declare const firebase: typeof import('firebase')

export const init = async () => {
  if (!firebase.apps.length) {
    firebase.initializeApp(config)
  }
  firebase.firestore().settings({ timestampsInSnapshots: true })
  try {
    await firebase
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
// export const app: () => firebase.app.App = () => firebase.app()
export const serverTimestamp = () =>
  firebase.firestore.FieldValue.serverTimestamp()

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

let _claims: { [key: string]: string } = {}
export function onAuthStateChangedWithClaims(
  claimsKeys: string[],
  callback: (
    user: firebase.User | null,
    claims: { [key: string]: string },
  ) => void,
) {
  return firebase.auth().onAuthStateChanged(async user => {
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
