import atImport from "postcss-import";
import resolveUrl from "postcss-url";
import atApply from "./build/plugins/postcss/at-apply.ts";
import atFunction from "./build/plugins/postcss/at-function.ts";

export default {
	plugins: [
		atImport(),
		atApply(),
		atFunction(),
		resolveUrl([
			{
				filter: /\.woff2$/,
				url: "copy",
				basePath: import.meta
					.resolve("@nerd-bible/fonts/dist")
					.replace("file://", ""),
				assetsPath: "../fonts",
				useHash: true,
				hashOptions: { append: true },
			},
			{
				filter: /\.(jpe?g|svg|png|webp)$/,
				url: "copy",
				basePath: "img",
				assetsPath: "../img",
				useHash: false,
			},
		]),
	],
};
