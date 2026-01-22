import type { Plugin } from "vite";

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

export default function l10nPlugin(): Plugin {
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
				// 	{
				// 		locale: "en-US",
				// 		ftl: ${JSON.stringify(l10n["en-US"])},
				// 		alternatives: {
				// 			${Object.keys(l10n)
				// 				.filter((k) => k !== "en-US")
				// 				.map(
				// 					(cur) =>
				// 						`${JSON.stringify(cur)}: () => import("l10n/${cur}").then(i => i.default),`,
				// 				)
				// 				.join(",\n")}
				// 		}
				// 	},
				// )`;
				id = normalizeId(id);
				return code.replace(tagRegex, (_, m1, m2) => {
					l10nImportees[id] ??= {};
					l10nImportees[id][m1] = m2;
					return "";
				});
			},
		},
		resolveId: {
			filter: { id: { include: [pathRegex, fullPathRegex, /^l10n$/, /^l10n\/runtime$/] } },
			handler(id, importee) {
				if (!importee) return;

				if (id === "l10n/runtime") {
					return this.resolve("./l10n.runtime.svelte.ts", import.meta.filename);
				} else if (id === "l10n") {
					return `${importee}.ts?l10n`;
				}
				let match = id.match(pathRegex);
				if (match) {
					return `${normalizeId(importee)}?l10n&lang=${match[1]}`;
				}
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
					let code = `import en from "l10n?lang=en-US";
import { makeT as makeT2 } from "l10n/runtime";

export const l10n = {
	default: { locale: "en-US", ftl: en },
	other: {
		${Object.keys(l10nImportees[normalizeId(parts.importee)] ?? {})
			.filter(k => k !== "en-US")
			.map(
				(lang) =>
					`"${lang}": () => import("l10n?lang=${lang}").then(m => m.default)`,
			)
			.join("\n\t\t,")}
	},
};

export const makeT = () => makeT2(l10n);
`;
					return code;
				}
			},
		},
	};
}
