import obsidianmd from "eslint-plugin-obsidianmd";

export default [
	{
		// main.js is the build artefact; views/ is user content; coverage/ is generated.
		ignores: [
			"main.js",
			"src/main.js",
			"node_modules/**",
			"dist/**",
			"views/**",
			"coverage/**",
		],
	},
	...obsidianmd.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			globals: {
				// Injected by esbuild's define at build time. Declared for
				// TypeScript in src/globals.d.ts, which ESLint does not read.
				__HYDRATE_DEV__: "readonly",
			},
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
];
