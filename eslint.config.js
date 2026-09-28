import js from '@eslint/js';
import globals from 'globals';

export default [
   {
      ignores: ['node_modules/**', 'build/**', 'public/**'],
   },
   js.configs.recommended,
   {
      files: ['**/*.cjs'],
      languageOptions: {
         globals: {
            __dirname: 'readonly',
            __filename: 'readonly',
            require: 'readonly',
            module: 'writable',
            exports: 'writable',
         },
      },
   },
   {
      files: ['src/**/*.js', 'vite/**/*.js', 'eslint.config.js'],
      languageOptions: {
         ecmaVersion: 'latest',
         sourceType: 'module',
         globals: {
            ...globals.browser,
            ...globals.node,
         },
      },
      rules: {
         semi: ['error', 'always'],
         quotes: [
            'warn',
            'single',
            { avoidEscape: true, allowTemplateLiterals: true },
         ],
         'comma-dangle': ['error', 'always-multiline'],
         'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      },
   },
];
