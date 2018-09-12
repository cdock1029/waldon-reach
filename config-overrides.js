const {
  rewireWebpack: rewireTypescript,
  rewireJest: rewireTypescriptJest,
} = require('react-app-rewire-typescript-babel-preset')
const { injectBabelPlugin } = require('react-app-rewired')
const { rewireEmotion } = require('react-app-rewire-emotion')
const rewireReactHotLoader = require('react-app-rewire-hot-loader')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

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

    return config
  },
  jest: function(config) {
    return rewireTypescriptJest(config)
  },
}
