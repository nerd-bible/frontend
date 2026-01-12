// https://iconify.design/docs
import type { UserConfig } from "@11ty/eleventy";

type Icon = {
	width: number;
	height: number;
	body: string;
};

export async function defaultLoader(name: string, set: string) {
	const path = `@iconify-icons/${set}/${name}.js`;
	try {
		const source = import.meta.resolve(path);
		const icon: Icon = (await import(source)).default;
		return `<svg xmlns="http://www.w3.org/2000/svg" width="${icon.width}" height="${icon.height}">${icon.body}</svg>`;
	} catch {
		console.error("could not resolve", path);
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
		async function (name: string, set = opts.defaultSet) {
			return opts.loader(name, set);
		},
	);
}
