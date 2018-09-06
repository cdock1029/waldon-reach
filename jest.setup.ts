// adds helpful assertions
import 'jest-dom/extend-expect'

// essentially: afterEach(cleanup)
import 'react-testing-library/cleanup-after-each'

import firebasemock from 'firebase-mock'

const mockauth = new firebasemock.MockAuthentication()
;(global as any).mocksdk = new firebasemock.MockFirebaseSdk(
  null, //RTDB
  () => mockauth,
  null, // firestore
  null, // storage
  null, // messaging
)

;(global as any).firebase = (global as any).mocksdk
