module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:unicorn/recommended",
	],
	plugins: ["svelte3", "@typescript-eslint", "unicorn"],
	overrides: [
		{
			files: ["*.svelte"],
			processor: "svelte3/svelte3",
			rules: {
				"unicorn/no-useless-undefined": "off", // `export let x = undefined` to make a property optional
			},
		},
	],
	settings: {
		"svelte3/typescript": () => require("typescript"),
	},
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
	},
	env: {
		browser: true,
		es2020: true,
		node: true,
	},
	rules: {
		"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
		"func-style": ["error", "declaration"],
		"prefer-arrow-callback": ["error", { allowUnboundThis: true }],
	},
}
