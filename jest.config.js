module.exports = {
  setupTestFrameworkScriptFile: require.resolve('./jest.setup.ts'),
  roots: ['<rootDir>/app'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.test.json',
      useBabelrc: true,
    },
  },
}
