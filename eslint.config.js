import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {
    files: ['#src/**/*.{js,mjs,cjs,jsx,tsx}'],
    ignores: ['node_modules/**'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    rules: {
      // ...js.configs.recommended.rules,
      // ...react.configs.recommended.rules,
      // ...react.configs['jsx-runtime'].rules,
      // ...reactHooks.configs.recommended.rules,
      // ...ts.configs.recommended.rules,

      //* правила
      semi: ['error', 'always'],
      quotes: [
        'warn',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
      'comma-dangle': ['error', 'never'],
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-mixed-spaces-and-tabs': 'off',

      //* react
      'react/prop-types': 'off', // отключаем propTypes (будем использовать TS)
      'react/react-in-jsx-scope': 'off', // React 17+ не требует import React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
