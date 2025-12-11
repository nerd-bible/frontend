import type { AtRule, Helpers, Node, Plugin, Rule } from "postcss";

export function getDecls(rule: Rule | AtRule): Node[] {
	return rule.nodes?.slice() ?? [];
}

export default function plugin(): Plugin {
	const applyableSelectors: Record<string, Node[]> = {};

	return {
		postcssPlugin: "postcss-apply",
		Rule(rule: Rule) {
			const decls = getDecls(rule);
			for (const s of rule.selectors) {
				if (s.startsWith("&")) continue; // don't resolve these cuz lazy
				// console.log("add", s);
				applyableSelectors[s] ??= [];
				applyableSelectors[s].push(...decls);
			}
		},
		AtRule: {
			apply(atRule: AtRule, helper: Helpers) {
				for (const selector of atRule.params.split(/\s+/)) {
					const decls = applyableSelectors[selector];
					// console.log("apply", selector);
					if (decls) atRule.parent?.append(...decls.map((d) => d.clone()));
					else atRule.warn(helper.result, `missing definition for ${selector}`);
				}

				atRule.remove();
			},
			utility(atRule: AtRule, _helper: Helpers) {
				// console.log("add", atRule.params);
				applyableSelectors[atRule.params] = getDecls(atRule);
				atRule.remove();
			},
		},
	};
}
