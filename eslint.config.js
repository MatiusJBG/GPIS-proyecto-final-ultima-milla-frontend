import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.integration/**', 'dist/**', 'node_modules/**', 'coverage/**', 'cypress/screenshots/**', 'cypress/videos/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['test/**/*.mjs'], languageOptions: { globals: { document: 'readonly' } } },
  { files: ['cypress/**/*.js'], languageOptions: { globals: { cy: 'readonly', Cypress: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly' } } },
  { rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] } },
);
