import type { UserConfig } from "@11ty/eleventy";
import pluginWebc from "@11ty/eleventy-plugin-webc";
import postcss from "postcss";
import pluginIcons from "./build/plugins/eleventy/iconify.ts";
import postcssConfig from "./postcss.config.js";

const fontPath = import.meta
	.resolve("@nerd-bible/fonts/dist")
	.replace("file://", "");

async function postcssTransform(content: string) {
	const result = await postcss(postcssConfig as any).process(content, {
		from: this.page.inputPath,
	});
	for (const w of result.warnings()) console.warn(w.toString());
	return result.css;
}

export default function (eleventyConfig: UserConfig) {
	eleventyConfig.addPassthroughCopy("img");
	eleventyConfig.addPassthroughCopy({ [fontPath]: "." });

	eleventyConfig.addPlugin(pluginWebc, {
		components: ["./components/**/*.webc", "npm:@11ty/is-land/*.webc"],
		bundlePluginOptions: {
			transforms: [postcssTransform],
		},
	});
	eleventyConfig.addPlugin(pluginIcons, {});

	eleventyConfig.setServerOptions({
		domDiff: false,
	});
}

export const config = {
	dir: {
		input: "index.webc",
		output: "dist",
	},
};
