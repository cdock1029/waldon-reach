import React from 'react'
import ReactDOM from 'react-dom'
import { firestore } from './lib/firebase'

import App from './components/App'
import './app.scss'

export default App

async function main() {
  // const renderMethod = (module as any).hot
  //   ? ReactDOM.render
  //   : ReactDOM.hydrate || ReactDOM.render
  const render = (Comp: React.ReactType) => {
    // renderMethod(<Comp />, document.getElementById('root'))
    ReactDOM.render(<Comp />, document.getElementById('root'))
  }

  try {
    await firestore.enablePersistence()
    console.log('persistence enabled..')
  } catch (e) {
    if (
      !e.message.includes('Firestore has already been started and persistence')
    ) {
      console.log({ e1: e })
    }
  } finally {
    render(App)
    // if ((module as any).hot) {
    //   ;(module as any).hot.accept('./components/App', () =>
    //     render(require('./components/App').default),
    //   )
    // }
  }
}

// if (typeof document !== 'undefined') {
main()
// }
