import atApply from "./plugins/postcss/at-apply.ts";
import atFunction from "./plugins/postcss/at-function.ts";

/** @type { options: import("postcss").ProcessOptions, plugins: import("postcss").AcceptedPlugin[] } */
export default {
	options: {},
	plugins: [
		atApply(),
		atFunction({
			globalPaths: ["./src/css/functions.css"],
		}),
	],
};
