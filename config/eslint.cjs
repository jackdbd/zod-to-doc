const prettier_config = require('./prettier.cjs')

const config = {
  extends: [
    // https://eslint.org/docs/rules/
    'eslint:recommended',
    // https://typescript-eslint.io/docs/linting/
    'plugin:@typescript-eslint/recommended',
    // plugin:prettier/recommended must be the last extension
    // https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
    'plugin:prettier/recommended'
  ],
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': ['error', prettier_config]
  }
}

// console.log('=== ESLint config ===', config)

module.exports = config
