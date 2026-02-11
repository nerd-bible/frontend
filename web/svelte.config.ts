import type { CompileOptions } from "svelte/compiler";

const opts: CompileOptions = {
	// This way every component update doesn't affect the CSS.
	css: "injected",
};
export default opts;
