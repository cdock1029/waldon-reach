const {
  rewireWebpack: rewireTypescript,
  rewireJest: rewireTypescriptJest,
} = require('react-app-rewire-typescript-babel-preset')
const convertPathsToAliases = require('convert-tsconfig-paths-to-webpack-aliases')
  .default
const { rewireEmotion } = require('react-app-rewire-emotion')
const tsconfig = require('./tsconfig.json') // all comments in tsconfig.json must be removed
const aliases = convertPathsToAliases(tsconfig)

module.exports = {
  webpack: function(config, env) {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...aliases,
    }
    config = rewireTypescript(config)
    let emotionOptions
    if (env === 'development') {
      emotionOptions = {
        sourceMap: true,
        autoLabel: true,
        labelFormat: '-[filename]-[local]',
      }
    } else if (env === 'production') {
      emotionOptions = {
        hoist: true,
      }
    }
    config = rewireEmotion(config, env, emotionOptions)
    return config
  },
  jest: function(config) {
    // Object.entries(tsconfig.compilerOptions.paths)
    //   .forEach(entry => {
    //     const [key, value]
    //   })
    config.moduleNameMapper = {
      ...config.moduleNameMapper,
      '^@comp/(.*)': '<rootDir>/src/components/$1',
      '^@page/(.*)': '<rootDir>/src/pages/$1',
      '^@lib/(.*)': '<rootDir>/src/lib/$1',
    }
    config = rewireTypescriptJest(config)
    return config
  },
}
