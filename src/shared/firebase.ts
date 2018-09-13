const msg =
  'There is another tab open with offline persistence enabled. Only one such tab'
export function init() {
  return firebase
    .firestore()
    .enablePersistence()
    .then(() => console.log('enabled!!'))
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
export function onAuthStateChangedWithClaims(
  claimsKeys: string[],
  callback: (
    user: firebase.User | null,
    claims: { [key: string]: string },
  ) => void,
) {
  return firebase.auth().onAuthStateChanged(async user => {
    const tempClaims = {}
    if (user) {
      const token = await user.getIdTokenResult()
      claimsData = claimsKeys.reduce((acc, claim) => {
        acc[claim] = token.claims[claim]
        return acc
      }, tempClaims)
    }
    claimsData = tempClaims
    callback(user, claimsData)
  })
}
export const getClaim = (key: string) => claimsData[key]
