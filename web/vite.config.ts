import { svelte } from "@sveltejs/vite-plugin-svelte";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import pkg from "./package.json";
import l10n from "./plugins/vite/l10n.ts";

export default defineConfig({
	build: {
		manifest: true,
		// https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill
		modulePreload: {
			polyfill: false,
		},
		target: "es2016",
		minify: false,
		cssMinify: false,
	},
	define: {
		APP_VERSION: JSON.stringify(pkg.version),
	},
	plugins: [
		Icons({
			compiler: "svelte",
		}),
		svelte(),
		l10n(),
		analyzer({ analyzerMode: "static" }),
	],
});
