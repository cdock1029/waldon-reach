// Modified codes from CRA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
    ),
)

export function register() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL('/', window.location.href)
    if (publicUrl.origin !== window.location.origin) {
      console.log('pub oring !== window loc origin:', {
        pubOrigin: publicUrl.origin,
        winLocOrigin: window.location.origin,
      })
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebookincubator/create-react-app/issues/2374
      return
    }
    console.log('adding event listener load..')
    window.addEventListener('load', () => {
      // const swUrl = `/service-worker.js`
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

      if (isLocalhost) {
        // 'This is running on localhost. Lets check if a service worker still exists or not.',
        checkValidServiceWorker(swUrl)

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://goo.gl/SC7cgQ',
          )
        })
      } else {
        // 'Is not local host. Just register service worker'
        registerValidSW(swUrl)
      }
    })
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the old content will have been purged and
                // the fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in your web app.
                console.log('New content is available; please refresh.')
                alert('New content is available. Please refresh the page!')
              } else {
                // At this point, everything has been precached.
                // It's the perfect time to display a
                // "Content is cached for offline use." message.
                console.log('Content is cached for offline use.')
              }
            }
          }
        }
      }
    })
    .catch(error => {
      console.error('Error during service worker registration:', error)
    })
}

function checkValidServiceWorker(sUrl) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(sUrl)
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const ct = response.headers.get('content-type')
      if (response.status === 404 || (!ct || ct.indexOf('javascript') === -1)) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload()
          })
        })
      } else {
        // 'Service worker found. Proceed as normal.'
        registerValidSW(sUrl)
      }
    })
    .catch(() => {
      console.log(
        'No internet connection found. App is running in offline mode.',
      )
    })
}
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister()
    })
  }
}
