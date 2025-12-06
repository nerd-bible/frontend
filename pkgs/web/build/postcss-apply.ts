import type { AtRule, Helpers, Plugin, Rule } from "postcss";
import type { NewChild } from "postcss/lib/container";

export function getDecls(rule: Rule | AtRule): NewChild[] {
	const res: NewChild[] = [];
	rule.walkDecls((d) => {
		// have to clone for some reason
		res.push({ prop: d.prop, value: d.value });
	});
	return res;
}

export default function plugin(): Plugin {
	const applyableSelectors: Record<string, NewChild[]> = {};

	return {
		postcssPlugin: "postcss-apply",
		Rule(rule: Rule) {
			const decls = getDecls(rule);
			for (const s of rule.selectors)
				applyableSelectors[s] = decls;
		},
		AtRule: {
			apply(atRule: AtRule) {
				for (const selector of atRule.params.split(/\s+/)) {
					const decls = applyableSelectors[selector];
					if (decls) atRule.parent?.append(...decls);
				}

				atRule.remove();
			},
			utility(atRule: AtRule, _helper: Helpers) {
				applyableSelectors[atRule.params] = getDecls(atRule);
				atRule.remove();
			},
		},
	};
}
