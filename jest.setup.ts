// adds helpful assertions
import 'jest-dom/extend-expect'

// essentially: afterEach(cleanup)
import 'react-testing-library/cleanup-after-each'

import firebasemock from 'firebase-mock'

const mockauth = new firebasemock.MockAuthentication()

const mocksdk = firebasemock.MockFirebaseSdk(
  null, //RTDB
  () => mockauth,
  null, // firestore
  null, // storage
  null, // messaging
)

mocksdk.auth().autoFlush()
mocksdk.auth().createUserWithEmailAndPassword('a@b.com', 'hello')
;(global as any).mocksdk = mocksdk
;(global as any).firebase = mocksdk
