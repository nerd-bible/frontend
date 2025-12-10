import { readFile } from "node:fs/promises";
import { dirname, parse, relative, resolve } from "node:path";
import type { Plugin } from "esbuild";
import postcss from "postcss";
import postcssConfig from "../../../postcss.config.js";

export default function babelPlugin(): Plugin {
	const processor = postcss(postcssConfig);

	return {
		name: "esbuild:postcss",

		setup(build) {
			build.onLoad({ filter: /\.css$/, namespace: "file" }, async (args) => {
				const source = await readFile(args.path, { encoding: "utf-8" });

				const { name, ext } = parse(args.path);
				const filename = name + ext;

				const result = await processor.process(source, {
					from: filename,
					map: {
						inline: false,
						sourcesContent: true,
						annotation: false,
					},
				});

				const sourceMap = result.map?.toJSON();
				if (sourceMap) {
					const cwd = process.cwd();
					const argsDir = dirname(args.path);
					sourceMap.sources = sourceMap.sources.map((source) =>
						relative(argsDir, resolve(cwd, source)),
					);
					delete sourceMap.file;
				}
				const sourceMapUrl =
					sourceMap &&
					`data:application/json;base64,${Buffer.from(JSON.stringify(sourceMap)).toString("base64")}`;
				const dependencies = result.messages
					.filter(({ type }) => type === "dependency")
					.map(({ file }) => file);

				// build.collectDependencies(args.path, dependencies);

				return {
					contents: result.css.toString(),
					// contents: sourceMap
					// 	? `${result.css.toString()}\n/*# sourceMappingURL=${sourceMapUrl} */\n`
					// 	: result.css.toString(),
					loader: "css",
					watchFiles: dependencies,
				};
			});
		},
	};
}
