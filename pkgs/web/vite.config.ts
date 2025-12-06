import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import solid from "vite-plugin-solid";
import apply from "./build/postcss-apply";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [solid({ hot: false }), analyzer({ analyzerMode: "static" })],
	build: {
		minify: false,
		cssMinify: false,
	},
	css: {
		postcss: {
			plugins: [apply(), autoprefixer()],
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
