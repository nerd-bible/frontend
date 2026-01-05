import { extname } from "node:path";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import iconify from "./build/plugins/vite/iconify";

const host = process.env["TAURI_DEV_HOST"];

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [iconify(), analyzer({ analyzerMode: "static" })],
	resolve: {
		conditions: ["node"],
	},
	build: {
		// minify: false,
		// cssMinify: false,
		// sourcemap: true,
		modulePreload: false,
		rollupOptions: {
			output: {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name && assetInfo.originalFileName) {
						const extType = extname(assetInfo.name);
						if (extType === ".woff2") {
							const path = assetInfo.originalFileName.replace(
								/^.*@nerd-bible\/fonts\/dist\/(.*).woff2$/,
								"$1",
							);
							return `fonts/${path}-[hash].[ext]`;
						}
					}
					return "assets/[name]-[hash].[ext]";
				},
			},
		},
	},
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
	},
});
