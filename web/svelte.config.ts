import type { SvelteConfig } from "@sveltejs/vite-plugin-svelte";

const config: SvelteConfig = {
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
};
export default config;
