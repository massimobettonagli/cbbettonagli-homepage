module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals',
    'next',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // ✅ Migliorie consigliate:
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['warn'],
    'prefer-const': 'warn',
    'eqeqeq': ['error', 'always'],
    'no-empty-function': 'warn',
    'no-debugger': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};