// import { app, firestore } from 'firebase'

// interface FB extends firebase.app.App {
//   initializeApp(config: any): firease.app.App
//   apps: firebase.app.App[]
//   firestore(): firebase.firestore.Firestore
// }

type FB = typeof import('firebase')
declare const firebase: FB
