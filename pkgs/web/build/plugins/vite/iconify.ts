import type { IconifyJSON } from "@iconify/types";
import { escape as htmlEscape } from "html-escaper";
import type { Plugin } from "vite";
import { dependencies } from "../../../package.json" with { type: "json" };

const installedSets: Record<string, IconifyJSON> = {};
for (const d in dependencies) {
	const split = d.split("/");
	if (split[0] === "@iconify-json")
		installedSets[split[1]] = (await import(d)).icons;
}

const re = new RegExp(
	`\\b(${Object.keys(installedSets).join("|")})\\s+([\\w-]+)`,
	"g",
);

export default function iconifyPlugin(): Plugin[] {
	const usedSets = new Set<string>();
	let source = "";
	function addIcons(input: string) {
		let match: RegExpExecArray | null;
		while ((match = re.exec(input))) {
			const iconSet = installedSets?.[match[1]];
			if (!iconSet) {
				this.warn(`Missing icon set ${match[1]}`);
				continue;
			}
			usedSets.add(match[1]);

			const icon = iconSet.icons?.[match[2]];
			if (!icon) {
				this.warn(`Icon set ${match[1]} does not have icon ${match[2]}`);
				continue;
			}

			const escaped = htmlEscape(icon.body);
			const dataUrl = `url("data:image/svg+xml,${escaped}")`;
			source += `.${match[1]}.${match[2]} { --svg: ${dataUrl} }\n`;
		}

		source += `${[...usedSets].map((v) => `.${v}`).join(",")} {
	width: 1em;
	height: 1em;
	background-color: currentColor;
	mask: no-repeat center / 100%;
	mask-image: var(--svg);
}`;
	}

	return [
		{
			name: "iconify-css:scan",
			configResolved() {
				source = "";
			},
			transform: {
				order: "pre",
				filter: { id: { exclude: /\.css$/ } },
				handler(src) {
					// console.log("scan", id, src.length);
					addIcons(src);
				},
			},
		},
		{
			name: "iconify-css:transform",
			transform: {
				order: "pre",
				filter: { id: { include: /\.css$/ } },
				handler(src) {
					return src.replace(`@import "iconify-css";`, source);
				},
			},
		},
	];
}
