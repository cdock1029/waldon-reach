const {
  rewireWebpack: rewireTypescript,
  rewireJest: rewireTypescriptJest,
  rewireTSLint,
} = require('react-app-rewire-typescript-babel-preset')
const { injectBabelPlugin } = require('react-app-rewired')
const { rewireEmotion } = require('react-app-rewire-emotion')
const rewireReactHotLoader = require('react-app-rewire-hot-loader')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
// const tsconfigJson = require('./tsconfig.json')
// const { resolve } = require('path')

// const alias = Object.entries(tsconfigJson.compilerOptions.paths).reduce(
//   (acc, [package, mapping]) => {
//     package = package.replace('/*', '')
//     mapping = mapping[0].replace('/*', '')
//     if (acc[package]) return acc

//     acc[package] = resolve('./', mapping)
//     return acc
//   },
//   {},
// )

module.exports = {
  webpack: function(config, env) {
    config = injectBabelPlugin('@babel/plugin-transform-runtime', config)

    config = rewireTypescript(config)
    config = rewireEmotion(config, {
      sourceMap: false,
      autoLabel: true,
      hoist: true,
    })
    config = rewireReactHotLoader(config, env)

    // Optional, needed if using the TSLint integration.
    // config = rewireTSLint(config /* {} - optional tslint-loader options */)

    config.plugins = (config.plugins || []).concat(
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'defer',
        preload: [/\/main\.[\w]+\.js$/],
      }),
    )
    config = rewireTSLint(config)

    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   ...alias,
    // }

    return config
  },
  jest: function(config) {
    return rewireTypescriptJest(config)
  },
}
