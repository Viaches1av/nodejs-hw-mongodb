export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off', // Отключение ошибок для использования console.log()
      'strict': 'off', // Отключение режима строгого использования
    },
    env: {
      node: true, // Указание, что это среда Node.js
      es2021: true, // Современная версия ECMAScript
    },
  },
];
