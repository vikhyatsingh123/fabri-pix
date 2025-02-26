module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended",
	],
	ignorePatterns: [
		"scripts",
		"dist",
		"lib",
		".eslintrc.cjs",
		"*.d.ts",
		"public/assets/js",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: { jsx: true },
		sourceType: "module",
	},
	plugins: ["react-refresh", "react", "@typescript-eslint"],
	rules: {
		"@typescript-eslint/no-unused-vars": "error",
		"@typescript-eslint/no-explicit-any": "error",
		"prefer-const": "warn",
		"react/react-in-jsx-scope": "off",
		"react/prop-types": "off",
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true },
		],
		"no-mixed-spaces-and-tabs": "warn",
		"no-console": "error",
	},
};
