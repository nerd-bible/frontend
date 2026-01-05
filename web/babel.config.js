import pkg from "./package.json" with { type: "json" };

/** @type import("@babel/core").TransformOptions */
const config = {
	exclude: "node_modules/**",
	presets: [
		"@babel/preset-typescript",
		["@babel/preset-env", { bugfixes: true, targets: pkg.browserslist }],
	],
};
export default config;
