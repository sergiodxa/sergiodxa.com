module.exports = {
	plugins: [
		"import",
		"jsx-a11y",
		"prefer-let",
		"prettier",
		"react-hooks",
		"react",
	],
	extends: [
		"@remix-run/eslint-config",
		"plugin:import/errors",
		"plugin:import/typescript",
		"plugin:import/warnings",
		"plugin:jsx-a11y/recommended",
		"plugin:prettier/recommended",
		"plugin:react-hooks/recommended",
		"plugin:react/recommended",
	],
	settings: {
		react: { version: "detect" },
		"import/resolver": { typescript: {} },
	},
	rules: {
		"prefer-const": "off",
		"prefer-let/prefer-let": 2,
		"no-unused-vars": "off",
		"no-var": "off",
		"react/function-component-definition": [
			"error",
			{
				namedComponents: "function-declaration",
				unnamedComponents: "arrow-function",
			},
		],
		"react/jsx-uses-react": "off",
		"react/react-in-jsx-scope": "off",
		"react/no-unescaped-entities": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "error",
		"jsx-a11y/anchor-is-valid": "off",

		"import/order": [
			"error",
			{
				alphabetize: {
					order: "asc",
				},
				groups: [
					"type",
					"builtin",
					"external",
					"internal",
					"parent",
					["sibling", "index"],
				],
				"newlines-between": "always",
				pathGroups: [],
				pathGroupsExcludedImportTypes: [],
			},
		],
	},
};
