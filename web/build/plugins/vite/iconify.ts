// https://rollupjs.org/plugin-development/
// https://iconify.design/docs/usage/css/no-code/
import type { IconifyJSON } from "@iconify/types";
import type { Plugin } from "vite";
import { dependencies } from "../../../package.json" with { type: "json" };

type TransformPluginContext = {
	warn: (msg: string) => void;
};

const installedSets: Record<string, IconifyJSON> = {};
for (const d in dependencies) {
	const split = d.split("/");
	if (split[0] === "@iconify-json")
		installedSets[split[1]] = (await import(d)).icons;
}
// Vite postpends `?direct` to css included from html.
const cssRegex = /(\.css(\?.*)?$)/;

const re = new RegExp(
	`\\b(${Object.keys(installedSets).join("|")})\\s+([\\w-]+)`,
	"g",
);

export default function iconifyPlugin(): Plugin[] {
	const usedIcons: Record<string, Set<string>> = {};
	let source = "";
	function addIcons(ctx: TransformPluginContext, input: string) {
		let match: RegExpExecArray | null;
		while ((match = re.exec(input))) {
			const iconSet = installedSets?.[match[1]];
			if (!iconSet) {
				ctx.warn(`Missing install for icon set @iconify-json/${match[1]}`);
				continue;
			}
			usedIcons[match[1]] ??= new Set<string>();

			const icon = iconSet.icons?.[match[2]];
			if (!icon) {
				ctx.warn(`Icon set ${match[1]} does not have icon ${match[2]}`);
				continue;
			}

			function encode(s: string) {
				// https://datatracker.ietf.org/doc/html/rfc3986#section-2.2
				return encodeURI(s).replaceAll("%20", " ");
			}

			if (!usedIcons[match[1]].has(match[2])) {
				const { width, height } = installedSets[match[1]];
				const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' width='${width}' height='${height}'>${icon.body.replaceAll('"', "'")}</svg>`;
				const dataUrl = `url("data:image/svg+xml,${encode(svg)}")`;
				source += `.${match[1]}.${match[2]} { --svg: ${dataUrl} }\n`;
				usedIcons[match[1]].add(match[2]);
			}
		}
	}
	const toWatch = new Set<string>();
	const watching = new Set<string>();

	return [
		{
			name: "iconify-css:scan",
			configResolved() {
				source = "";
			},
			transform: {
				order: "pre",
				filter: { id: { exclude: [/node_modules/, cssRegex] } },
				handler(src, id) {
					this.environment.config.mode;
					// console.log("scan", id, src.length);
					toWatch.add(id);
					addIcons(this, src);
				},
			},
			transformIndexHtml(src, ctx) {
				// console.log("scan", ctx.filename);
				toWatch.add(ctx.filename);
				addIcons(this, src);
			},
		},
		{
			name: "iconify-css:transform",
			transform: {
				order: "pre",
				filter: { id: { include: cssRegex } },
				handler(src, _id) {
					const needToWatch = toWatch.difference(watching);
					for (const f of needToWatch) {
						// console.log("watch", f)
						this.addWatchFile(f);
					}
					// console.log("transform", _id);
					const withSets = `${source}${Object.keys(usedIcons)
						.map((v) => `.${v}`)
						.join(",")} {
	width: 1em;
	height: 1em;
	background-color: currentColor;
	mask: no-repeat center / 100%;
	mask-image: var(--svg);
}`;
					return src.replace(`@import "iconify-css";`, withSets);
				},
			},
		},
	];
}
