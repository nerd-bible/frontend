import { readFile } from "node:fs/promises";
import { parse } from "node:path";
import { transformAsync } from "@babel/core";
import type { Plugin } from "esbuild";
import babelConfig from "../../../babel.config.js";

export default function babelPlugin(): Plugin {
	return {
		name: "esbuild:solid",

		setup(build) {
			build.onLoad(
				{ filter: /\.(t|j)sx$/, namespace: "file" },
				async (args) => {
					const source = await readFile(args.path, { encoding: "utf-8" });

					const { name, ext } = parse(args.path);
					const filename = name + ext;

					const result = await transformAsync(source, {
						filename,
						sourceMaps: "inline",
						...babelConfig,
					});

					if (result?.code === undefined || result.code === null) {
						throw new Error("No result was provided from Babel");
					}

					return { contents: result.code, loader: "js" };
				},
			);
		},
	};
}
