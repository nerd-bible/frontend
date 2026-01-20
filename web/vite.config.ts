import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { webComponent } from "./plugins/vite/web-component";
import pkg from "./package.json";

export default defineConfig({
	build: {
		manifest: true,
		// https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill
		modulePreload: {
			polyfill: false,
		},
		target: "es2016",
	},
	define: {
		"APP_VERSION": JSON.stringify(pkg.version),
	},
	plugins: [
		Icons({
			compiler: "web-components",
			webComponents: {
				autoDefine: true,
			},
		}),
		webComponent(),
	],
});
