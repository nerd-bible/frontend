import { basename, join } from "node:path";
import { Parser as HTMLParser } from "htmlparser2";
import postcss from "postcss";
import type { Plugin } from "vite";
import postcssConfig from "../../postcss.config";

const toTitle = (s: string) =>
	s.charAt(0).toUpperCase() +
	s
		.substring(1)
		.replace(/([-_][a-z])/gi, ($1) =>
			$1.toUpperCase().replace("-", "").replace("_", ""),
		);

export function webComponent(): Plugin {
	type Id = string;
	const styleGlobalCache: Record<Id, string> = {};
	const l10nGlobalCache: Record<Id, string> = {};

	return {
		name: "vite-plugin-web-component",
		enforce: "pre",
		transform: {
			filter: { id: /\.html\?(c|global.css)$/ },
			async handler(code, id) {
				// console.log("transform", id);
				if (id.endsWith("?global.css")) return;

				let styleLocal = "";
				let styleGlobal = "";
				let js = "";
				let icons: Record<string, Set<string>> = {};
				let html = "";
				let cur: "styleLocal" | "styleGlobal" | "js" | "html" | "l10n" = "html";
				let curLang = "en-US";
				const l10n: Record<string, string> = {};

				function append(text: string) {
					switch (cur) {
						case "styleLocal":
							styleLocal += text;
							break;
						case "styleGlobal":
							styleGlobal += text;
							break;
						case "js":
							js += text;
							break;
						case "html":
							html += text;
							break;
						case "l10n":
							l10n[curLang] ??= "";
							l10n[curLang] += text;
							break;
					}
				}

				const parser = new HTMLParser({
					onopentag(tag, attrs, unary) {
						if (tag === "script") {
							cur = "js";
						} else if (tag === "style") {
							cur = "global" in attrs ? "styleGlobal" : "styleLocal";
						} else if (tag === "l10n") {
							cur = "l10n";
							curLang = attrs.lang;
						} else if (cur === "html") {
							if (tag.startsWith("icon-")) {
								const [_, set, ...name] = tag.split("-");
								icons[set] ??= new Set();
								icons[set].add(name.join("-"));
							}
							html += "<" + tag;

							for (const a in attrs) {
								html +=
									" " +
									a +
									'="' +
									(attrs[a] || "").replace(/"/g, "&#34;") +
									'"';
							}

							html += (unary ? "/" : "") + ">";
						}
					},
					ontext(text) {
						append(text);
					},
					onclosetag(tag) {
						if (cur === "html") html += "</" + tag + ">";
						cur = "html";
					},
				});
				parser.write(code);
				parser.end();

				const styleLocalResult = await postcss(postcssConfig.plugins).process(
					styleLocal,
					{
						from: id,
						to: id,
						...postcssConfig.options,
					},
				);
				for (const m of styleLocalResult.messages) console.warn(m.toString());
				styleLocal = styleLocalResult.css;

				const customElementName = basename(id, ".html?c");
				const className = toTitle(customElementName);
				for (const lang in l10n) {
					const key = id.replace(/\?c$/, `?lang=${lang}`);
					l10nGlobalCache[key] = l10n[lang].trim();
				}

				// imports
				code = 'import { NbElement } from "./base";\n';
				for (const set in icons) {
					for (const icon of icons[set])
						code += `import '~icons/${set}/${icon}';\n`;
				}
				if (styleGlobal) {
					const key = id.replace(/\?c$/, "?global.css");
					styleGlobalCache[key] = styleGlobal;
					code += `import ${JSON.stringify(key)};\n`;
				}
				code += "\n";

				const element = `NbElement(
					${JSON.stringify(className)},
					${JSON.stringify(html)},
					${JSON.stringify(styleLocal)},
					{
						locale: "en-US",
						ftl: ${JSON.stringify(l10n["en-US"])},
						alternatives: {
							${Object.keys(l10n)
								.filter((k) => k !== "en-US")
								.map(
									(cur) =>
										`${JSON.stringify(cur)}: () => import("l10n/${cur}").then(i => i.default),`,
								)
								.join(",\n")}
						}						
					},
				)`;
				code += `let customElement = class ${className} extends ${element} {};\n`;
				code += js;
				code += `customElements.define(${JSON.stringify(customElementName)}, customElement);\n`;

				return { code };
			},
		},
		resolveId: {
			filter: { id: { include: [/\.html\?global\.css$/, /^l10n\//] } },
			handler(id, importee) {
				if (id.startsWith("l10n/")) {
					return importee?.replace(
						/\?c$/,
						`?lang=${id.substring("l10n/".length)}`,
					);
				}
				return id;
			},
		},
		load: {
			filter: { id: { include: [/\.html\?global\.css$/, /\?lang=[\w-]+$/] } },
			handler(id) {
				if (id.match(/\?lang=[\w-]+$/)) {
					return `export default ${JSON.stringify(l10nGlobalCache[id])}`;
				} else {
					return { code: styleGlobalCache[id], moduleType: "text" };
				}
			},
		},
	};
}
