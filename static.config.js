import path from 'path'
import React from 'react'

export default {
  plugins: [
    'react-static-plugin-sass',
    'react-static-plugin-typescript',
    'react-static-plugin-emotion',
  ],
  entry: path.join(__dirname, 'src', 'index.tsx'),
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  getSiteData: () => ({
    title: 'Waldon',
  }),
  Document: ({ Html, Head, Body, children }) => (
    <Html lang="en-US">
      <Head>
        <link
          rel="preload"
          href="https://unpkg.com/react-table@6.8.6/react-table.css"
          as="style"
        />
        {/* <link
          rel="preload"
          href="https://www.gstatic.com/firebasejs/5.3.0/firebase-app.js"
          as="script"
        />
        <link
          rel="preload"
          href="https://www.gstatic.com/firebasejs/5.3.0/firebase-auth.js"
          as="script"
        />
        <link
          rel="preload"
          href="https://www.gstatic.com/firebasejs/5.3.0/firebase-firestore.js"
          as="script"
        /> */}

        <link
          href="https://unpkg.com/react-table@6.8.6/react-table.css"
          rel="stylesheet"
        />
        {/* <script src="https://www.gstatic.com/firebasejs/5.3.0/firebase-app.js" />
        <script src="https://www.gstatic.com/firebasejs/5.3.0/firebase-auth.js" />
        <script src="https://www.gstatic.com/firebasejs/5.3.0/firebase-firestore.js" /> */}
      </Head>
      <Body>{children}</Body>
    </Html>
  ),
}
