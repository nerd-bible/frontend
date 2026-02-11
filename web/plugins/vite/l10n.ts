import type { EnvironmentModuleNode, Plugin } from "vite";
import { minify } from "./l10n.minifier.ts";

// Save having to use a proper HTML parser + generating source map
// If we did have to, I'd use parse5 + @jridgewell/gen-mapping
const tagRegex = /<l10n lang="([^"]+)">([\s\S]*?)<\/l10n>/g;
const pathRegex = /^l10n\?lang=([\w-]+)/;
// For loader that has no knowledge of importee
const fullPathRegex = /^([_/\\\w.-]*)\?l10n(?:\&lang=([\w-]+))?$/;

function toParts(id: string): { importee: string; lang?: string } | undefined {
	const match = id.match(fullPathRegex);
	if (match) return { importee: match[1], lang: match[2] };
}
function normalizeId(id: string) {
	return id.replace(/\?.*$/, "").replace(/\.svelte(\.ts)?$/, "");
}

export default function l10nPlugin(opts: {
	runtimePath: string,
	defaultLocale: string
}): Plugin {
	type Importee = string;
	type Lang = string;
	type Ftl = string;
	const l10nImportees: Record<Importee, Record<Lang, Ftl>> = {};

	return {
		name: "vite-plugin-html-l10n",
		enforce: "pre",
		transform: {
			filter: { id: /\.svelte$/ },
			async handler(code, id) {
				id = normalizeId(id);
				let hasL10n = false;
				let res = code.replace(tagRegex, (_, m1, m2) => {
					hasL10n = true;
					l10nImportees[id] ??= {};
					l10nImportees[id][m1] = minify(m2);

					return "";
				});
				if (hasL10n) {
					// Ya, this is ghetto
					res = res.replace(
						"</script>",
						'\nimport { makeT } from "l10n";\nconst t = makeT();\n</script>',
					);
				}

				return res;
			},
		},
		resolveId: {
			filter: {
				id: {
					include: [pathRegex, fullPathRegex, /^l10n$/, /^l10n\/runtime$/],
				},
			},
			handler(id, importee) {
				if (!importee) return;

				if (id === "l10n/runtime") {
					return this.resolve(opts.runtimePath);
				} else if (id === "l10n") {
					return `${importee}.ts?l10n`;
				}
				let match = id.match(pathRegex);
				if (match) return `${normalizeId(importee)}?l10n&lang=${match[1]}`;
				if (id.match(fullPathRegex)) return id;
			},
		},
		load: {
			filter: { id: fullPathRegex },
			handler(id) {
				const parts = toParts(id);
				if (parts?.lang) {
					const ftl = JSON.stringify(
						l10nImportees[parts.importee][parts.lang] ?? "",
					);
					return `export default ${ftl}`;
				} else if (parts?.importee) {
					const normalized = normalizeId(parts.importee);
					let code = `
import en from "l10n?lang=${opts.defaultLocale}";
import { makeT as makeT2 } from "l10n/runtime";

export function makeT() { return makeT2(l10n); }
export const l10n = {
	default: { locale: "${opts.defaultLocale}", ftl: en },
	other: {
`;
					for (const k in l10nImportees[normalized] ?? {}) {
						if (k === opts.defaultLocale) continue;
						code += `"${k}": () => import("l10n?lang=${k}").then(m => m.default)\n\t\t,`;
					}
					code += `
	 }
}`;
					return code;
				}
			},
		},
		hotUpdate({ file, modules }) {
			// Docs really aren't great. I learned via a couple hours of trial and
			// error.
			// https://vite.dev/changes/hotupdate-hook
			// https://bjornlu.com/blog/hot-module-replacement-is-easy
			// https://github.com/sveltejs/vite-plugin-svelte/blob/main/packages/vite-plugin-svelte/src/plugins/hot-update.js
			const invalidatedModules = new Set<any>();
			const invalidateL10n = (m?: EnvironmentModuleNode): boolean => {
				if (!m) return false;

				if (fullPathRegex.test(m?.id ?? "")) invalidatedModules.add(m);
				for (const m2 of m.importedModules) invalidateL10n(m2);

				return invalidatedModules.size > 0;
			};

			const untouched: EnvironmentModuleNode[] = [];
			for (const m of modules) {
				if (m.id === file) invalidateL10n(m);
				else untouched.push(m);
			}
			if (invalidatedModules.size) return [...invalidatedModules, ...untouched];
		},
	};
}
