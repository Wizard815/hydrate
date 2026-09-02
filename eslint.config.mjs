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
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
];
