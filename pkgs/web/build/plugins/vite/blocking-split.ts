import type { Plugin } from "vite";

export default function renderBlockingPlugin(): Plugin {
	return {
		name: "html-render-blocking",
		configResolved(config) {
		},
		transformIndexHtml(src) {
			return src.replace('<script', '<script defer ');
		},
		generateBundle() {
			console.log("generateBundle");
		}
	};
}
