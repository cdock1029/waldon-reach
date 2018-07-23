import path from 'path'
import dotenv from 'dotenv'
import React from 'react'
dotenv.config()

// Paths Aliases defined through tsconfig.json
// const typescriptWebpackPaths = require('./webpack.config.js')

export default {
  plugins: ['react-static-plugin-typescript', 'react-static-plugin-sass'],
  entry: path.join(__dirname, 'src', 'index.tsx'),
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  getSiteData: () => ({
    title: 'Waldon',
  }),
  Document: ({ Html, Head, Body, children, siteData, renderMeta }) => (
    <Html lang="en-US">
      <Head>
        {/* <link
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB"
          crossOrigin="anonymous"
        /> */}
        <link
          href="https://unpkg.com/react-table@6.8.6/react-table.css"
          rel="stylesheet"
        />
      </Head>
      <Body>{children}</Body>
    </Html>
  ),
  // getRoutes: async () => {
  //   return [
  //     {
  //       path: '/blog',
  //       getData: () => ({
  //         posts,
  //       }),
  //       children: posts.map(post => ({
  //         path: `/post/${post.id}`,
  //         component: 'src/containers/Post',
  //         getData: () => ({
  //           post,
  //         }),
  //       })),
  //     },
  //   ]
  // },
  // webpack: config => {
  //   config.resolve.alias = typescriptWebpackPaths.resolve.alias
  //   return config
  // },
}
