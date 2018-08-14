import * as firebaseFunctions from 'firebase-functions'
import firebaseAdmin, { auth as authTypes } from 'firebase-admin'
firebaseAdmin.initializeApp()
firebaseAdmin.firestore().settings({ timestampsInSnapshots: true })

export const admin = firebaseAdmin
export const auth = authTypes
export function wasCalled(functionName: string): boolean {
  return (
    !process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === functionName
  )
}

export const functions = firebaseFunctions
export const config = functions.config()
