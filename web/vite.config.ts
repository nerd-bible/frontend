import { svelte } from "@sveltejs/vite-plugin-svelte";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import pkg from "./package.json";
import l10n from "./plugins/vite/l10n.ts";
import locales from "./src/locales.ts";

export default defineConfig({
	build: {
		manifest: true,
		// https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill
		modulePreload: {
			polyfill: false,
		},
		target: "es2016",
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
						test(id) {
							return id.endsWith(`?l10n&lang=${l}`);
						},
					})),
				},
			},
		},
	},
	define: {
		APP_VERSION: JSON.stringify(pkg.version),
	},
	plugins: [
		Icons({
			compiler: "svelte",
		}),
		svelte(),
		l10n({
			runtimePath: import.meta
				.resolve("./src/l10n.svelte.ts")
				.replace("file://", ""),
			defaultLocale: "en-US",
		}),
		analyzer({
			analyzerMode: "static",
			fileName: "stats.html",
		}),
	],
});
