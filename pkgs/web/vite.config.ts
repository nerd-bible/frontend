import tailwindcss from "@tailwindcss/vite";
import browserslist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import solid from "vite-plugin-solid";

const host = process.env.TAURI_DEV_HOST;
const target = "es6";
const list = browserslist(`fully supports ${target}`);

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [solid(), tailwindcss(), analyzer({ analyzerMode: "static" })],
	// lightningcss is what tailwindcss uses anyways
	css: {
		transformer: "lightningcss",
		lightningcss: { targets: browserslistToTargets(list) }
	},
	build: { target },

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
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
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
});
