import path from 'path'
import React from 'react'

export default {
  plugins: ['react-static-plugin-sass', 'react-static-plugin-typescript'],
  entry: path.join(__dirname, 'src', 'index.tsx'),
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  getSiteData: () => ({
    title: 'Waldon',
  }),
  Document: ({ Html, Head, Body, children, siteData, renderMeta }) => (
    <Html lang="en-US">
      <Head>
        <link
          href="https://unpkg.com/react-table@6.8.6/react-table.css"
          rel="stylesheet"
        />
      </Head>
      <Body>{children}</Body>
    </Html>
  ),
}
