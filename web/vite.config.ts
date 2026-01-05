import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import iconify from "./build/plugins/vite/iconify";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [iconify(), analyzer({ analyzerMode: "static" })],
	resolve: {
		conditions: ["node"],
		alias: {
			"wa-sqlite.wasm": "wa-sqlite/dist/wa-sqlite.wasm",
		},
	},
	build: {
		// minify: false,
		// cssMinify: false,
		// sourcemap: true,
		modulePreload: false,
	},
	optimizeDeps: { exclude: ["@sqlite.org/sqlite-wasm"] },
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		// for SharedArray for WASM pthreads
		// headers: {
		// 	"Cross-Origin-Opener-Policy": "same-origin",
		// 	"Cross-Origin-Embedder-Policy": "require-corp",
		// },
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
