import { svelte } from "@sveltejs/vite-plugin-svelte";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import pkg from "./package.json";
import locales from "./src/locales.ts";

export default defineConfig({
	resolve: {
		conditions: [
			"nbsource",
			"module",
			"browser",
			"development",
			"svelte",
			"import",
		],
	},
	build: {
		// manifest: true,
		// https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill
		modulePreload: {
			polyfill: false,
		},
		target: "es" + pkg.browserslist.match(/\d+/)![0],
		// minify: false,
		// cssMinify: false,
		rolldownOptions: {
			output: {
				entryFileNames: "assets/[name].js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name].[ext]",
				codeSplitting: {
					groups: Object.keys(locales).map((l) => ({
						name: l,
						test: (id) => id.endsWith(`?l10n&lang=${l}`),
					})),
				},
			},
		},
	},
	define: {
		APP_VERSION: JSON.stringify(pkg.version),
	},
	plugins: [
		Icons({ compiler: "svelte" }),
		svelte({ compilerOptions: { experimental: { async: true } } }),
		process.env["analyze"] &&
			analyzer({ analyzerMode: "static", fileName: "stats.html" }),
	],
});
