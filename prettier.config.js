/**
 * @import { Config } from "prettier"
 * @import { PrettierConfig as Svelte } from "prettier-plugin-svelte"
 * @import { SqlPluginOptions as Sql } from "prettier-plugin-sql-cst"
 * @import { PrettierPluginEmbedOptions as Embed } from "prettier-plugin-embed"
 */
import baseConfig from "@nerd-bible/config/prettier";

/** @type {Config & Svelte & Sql & Embed} */
const config = {
	...baseConfig,
	plugins: [
		"prettier-plugin-svelte",
		"prettier-plugin-sql-cst",
		"prettier-plugin-embed",
	],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
	svelteIndentScriptAndStyle: false,
	embeddedSqlTags: ["sql"],
	embeddedSqlPlugin: "prettier-plugin-sql-cst",
	sqlFunctionCase: "lower",
};
export default config;
