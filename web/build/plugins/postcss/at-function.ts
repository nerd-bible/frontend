import type { AtRule, Helpers, Plugin } from "postcss";
import { Declaration } from "postcss";

type CssFunction = { args: string[]; value: string };

// YUCK!
// More proper parsing is here: https://github.com/csstools/postcss-plugins/compare/postcss-custom-functions--amiable-deer-0f9bf424a9
// Should be different syntax for decl/caller
// Maybe this can work?
// https://github.com/postcss/postcss/blob/main/docs/syntax.md
const fnPattern = /(--[\w-]+)\(([\w-.]+(?:,\s*[\w-.]+)*)\)/;
function parseFn(s: string) {
	const parsed = fnPattern.exec(s);
	if (!parsed) return; // probably some other valid syntax

	return { name: parsed[1], args: parsed[2].split(/,\s+/) };
}

// Needs a lot of work to be spec-compliant
export default function plugin(): Plugin {
	const functions: Record<string, CssFunction> = {};

	return {
		postcssPlugin: "postcss-function",
		Declaration(d: Declaration, helper: Helpers) {
			let nextValue = d.value;
			let parsed: ReturnType<typeof parseFn>;
			while ((parsed = parseFn(nextValue))) {
				const fn = functions[parsed.name];
				if (!fn) {
					d.warn(
						helper.result,
						`Missing @function declaration for ${parsed.name}`,
					);
					return;
				}

				if (fn.args.length !== parsed.args.length) {
					d.warn(
						helper.result,
						`Expected ${fn.args.length} args, not ${parsed.args.length}`,
					);
					return;
				}

				let evaled = fn.value;
				for (let i = 0; i < parsed.args.length; i++) {
					evaled = evaled.replace(new RegExp(fn.args[i], "g"), parsed.args[i]);
				}

				nextValue = nextValue.replace(fnPattern, evaled);
			}
			d.value = nextValue;
		},
		AtRule: {
			function(atRule: AtRule, helper: Helpers) {
				const parsed = parseFn(atRule.params);

				if (!parsed) {
					atRule.warn(helper.result, `Invalid syntax ${atRule.params}`);
					return;
				}

				const result = atRule.nodes?.find(
					(n) => n instanceof Declaration && n.prop === "result",
				) as Declaration | undefined;
				if (!result) {
					atRule.warn(helper.result, "Missing `result:` declaration");
					return;
				}

				functions[parsed.name] = { args: parsed.args, value: result.value };

				atRule.remove();
			},
		},
	};
}
