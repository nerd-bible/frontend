import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import solid from "vite-plugin-solid";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [solid(), tailwindcss(), analyzer({ analyzerMode: "static" })],
	// TODO: make all this work, see ./browser-support.md
	// css: {
	// 	transformer: "lightningcss",
	// 	lightningcss: { targets: browserslistToTargets(list) }
	// },
	// build: { target },

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
