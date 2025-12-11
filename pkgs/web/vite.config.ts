import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import iconify from "./build/plugins/vite/iconify";
import renderBlocking from "./build/plugins/vite/blocking-split";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [iconify(), renderBlocking(), analyzer({ analyzerMode: "static" })],
	resolve: {
		conditions: ["bun"],
	},
	build: {
		// minify: false,
		// cssMinify: false,
		// sourcemap: true,
		modulePreload: false,
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
