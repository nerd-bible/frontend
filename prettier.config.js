import baseConfig from "@nerd-bible/config/prettier";

/** @type {import("prettier").Config} */
const config = {
	...baseConfig,
	plugins: ["prettier-plugin-svelte"],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
	svelteIndentScriptAndStyle: false,
};
export default config;
