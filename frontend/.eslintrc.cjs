module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { browser: true, es2021: true },
  rules: {
    // App.tsx is intentionally untyped JSX ported from a published artifact;
    // allow the file-level @ts-nocheck without forcing a 700-line typing pass.
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-nocheck': false, 'ts-expect-error': 'allow-with-description' }],
  },
};
