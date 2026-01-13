// https://iconify.design/docs
import type { UserConfig } from "@11ty/eleventy";
import type { IconifyJSON } from "@iconify/types";
import { optimize } from "svgo";

export async function defaultLoader(
	name: string,
	set: string,
	userAttrs: Record<string, string>,
) {
	const path = `@iconify-json/${set}`;
	try {
		const icons = (await import(path)).icons as IconifyJSON;
		const icon = icons.icons[name];
		if (!icon) throw Error(`icon set ${set} has no icon ${name}`);

		const attrs: Record<string, string> = {
			xmlns: "http://www.w3.org/2000/svg",
		};
		const width = icon.width ?? icons.width;
		const height = icon.height ?? icons.height;
		if (width) attrs.width = width.toString();
		if (height) attrs.height = height.toString();
		if (width && height) attrs.viewBox = `0 0 ${width} ${height}`;
		Object.assign(attrs, userAttrs);

		const attrsString = Object.entries(attrs)
			.map(([k, v]) => `${k}="${v}"`)
			.join(" ");
		const svg = `<svg ${attrsString}>${icon.body}</svg>`;
		return optimize(svg, { path, multipass: true, floatPrecision: 2 }).data;
	} catch (err) {
		console.error(`error resolving and importing ${path}:\n`, err);
		return "<svg></svg>";
	}
}

const defaultOptions = {
	shortcode: "icon",
	defaultSet: "mingcute",
	loader: defaultLoader,
};

export default function iconifyPlugin(
	eleventyConfig: UserConfig,
	options: Partial<typeof defaultOptions> = {},
) {
	const opts = {
		...defaultOptions,
		...options,
	};

	eleventyConfig.addShortcode(
		opts.shortcode,
		(name: string, set = opts.defaultSet, attrs: Record<string, string> = {}) =>
			opts.loader(name, set, attrs),
	);
}
