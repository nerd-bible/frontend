import atApply from "./build/plugins/postcss/at-apply.ts";
import atFunction from "./build/plugins/postcss/at-function.ts";

export default {
	plugins: [atApply(), atFunction()],
};
