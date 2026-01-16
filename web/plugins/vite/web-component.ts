import { Parser as HTMLParser } from "htmlparser2";
import postcss from "postcss";
import type { Plugin } from "vite";
import postcssConfig from "../../postcss.config";

export function webComponent(): Plugin {
	return {
		name: "vite-plugin-web-component",
		enforce: "pre",
		transform: {
			filter: { id: /\.html\?c$/ },
			async handler(code, id) {
				let styleLocal = "";
				let styleGlobal = "";
				let js = "";
				let html = "";
				let cur: "styleLocal" | "styleGlobal" | "js" | "html" = "html";

				function append(text: string) {
					if (cur === "styleLocal") styleLocal += text;
					else if (cur === "styleGlobal") styleGlobal += text;
					else if (cur === "js") js += text;
					else if (cur === "html") html += text;
				}

				const parser = new HTMLParser({
					onopentag(tag, attrs, unary) {
						if (tag === "script") {
							cur = "js";
						} else if (tag === "style") {
							cur = "global" in attrs ? "styleGlobal" : "styleLocal";
						} else if (cur === "html") {
							if (tag.startsWith("icon-")) {
								const [_, set, ...name] = tag.split("-");
								js += `import '~icons/${set}/${name.join("-")}'`;
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
						if (tag === "script" || tag === "style") cur = "html";
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

				return {
					code: `const styleLocal = ${JSON.stringify(styleLocal)};
const html = ${JSON.stringify(html)};
${js}`,
				};
			},
		},
	};
}
