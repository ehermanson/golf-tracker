/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true,
		commonjs: true,
		es6: true,
	},

	// Base config
	extends: [
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'prettier',
	],

	rules: {
		'@typescript-eslint/consistent-type-imports': [
			'warn',
			{
				prefer: 'type-imports',
				disallowTypeAnnotations: true,
				fixStyle: 'inline-type-imports',
			},
		],
		'import/no-duplicates': ['warn', { 'prefer-inline': true }],
		'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
		'react/jsx-no-leaked-render': ['off'],
	},

	overrides: [
		// Jest/Vitest
		{
			files: ['**/*.test.{js,jsx,ts,tsx}'],
			plugins: ['jest', 'jest-dom', 'testing-library'],
			extends: [
				'plugin:jest/recommended',
				'plugin:jest-dom/recommended',
				'plugin:testing-library/react',
			],
			env: {
				'jest/globals': true,
			},
			settings: {
				jest: {
					// we're using vitest which has a very similar API to jest
					// (so the linting plugins work nicely), but it means we have to explicitly
					// set the jest version.
					version: 28,
				},
			},
		},

		// Cypress
		{
			files: ['cypress/**/*.ts'],
			plugins: ['cypress'],
			extends: ['plugin:cypress/recommended'],
		},
	],
};
