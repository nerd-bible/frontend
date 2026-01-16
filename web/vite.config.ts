import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { webComponent } from "./plugins/vite/web-component";

export default defineConfig({
	build: {
		manifest: true,
		// https://guybedford.com/es-module-preloading-integrity#modulepreload-polyfill
		modulePreload: {
			polyfill: false,
		},
		target: "es2016",
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
