export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
      'strict': 'off',
    },
    env: {
      node: true,
      es2021: true,
    },
  },
];
