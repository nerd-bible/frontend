import type { UserConfig } from "@11ty/eleventy";
import pluginWebc from "@11ty/eleventy-plugin-webc";
import postcss from "postcss";
import postcssConfig from "./postcss.config.js";

const fontPath = import.meta
	.resolve("@nerd-bible/fonts/dist")
	.replace("file://", "");

async function postcssTransform(content) {
	const result = await postcss(postcssConfig as any).process(content, {
		from: this.page.inputPath,
	});
	return result.css;
}

export default function (eleventyConfig: UserConfig) {
	eleventyConfig.addPlugin(pluginWebc, {
		components: ["./components/**/*.webc", "npm:@11ty/is-land/*.webc"],
		bundlePluginOptions: {
			transforms: [postcssTransform],
		},
	});
	eleventyConfig.addPassthroughCopy("img");
	eleventyConfig.addPassthroughCopy({ [fontPath]: "." });
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
