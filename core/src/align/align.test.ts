// import { readFileSync } from "node:fs";
// import chalk from "chalk";
// import { NWaligner } from "seqalign";
// import { Relaxed } from "../conllu";
// import { patienceDiffPlus } from "./diff";
// import { diff as calcPatch } from "fast-myers-diff";
//
// const parser = new Relaxed();
// const hboUd = parser.parse(
// 	readFileSync("/home/thesm/src/hbo-UD/data/checked/genesis.conllu", "utf8"),
// );
//
// const tanachUs = parser.parse(
// 	readFileSync("/home/thesm/src/nerd-bible/tanach.us/dist/gen.conllu", "utf8"),
// );
//
// function normalize(s: string) {
// 	return s
// 		.normalize("NFD")
// 		.replace(/\p{M}/gu, "")
// 		.replaceAll("׃ ", "׃\n")
// 		.replace(/([^\s])׀/g, "$1 ׀")
// 		.replaceAll("פ\n", "\n\n")
// 		.replaceAll("ס\n", "\n\n\n");
// }
//
// function toString(doc: typeof hboUd) {
// 	let res = "";
// 	for (const s of doc.sentences) {
// 		if (s.header["sent_id"]?.includes("qere")) continue;
//
// 		const maybePara = s.header["newpar class"];
// 		if (maybePara) {
// 			res += maybePara;
// 			res += "\n";
// 		}
// 		res += s.header["text"];
//
// 		res += "\n";
// 	}
// 	return normalize(res);
// }
//
// function tokenize(s: string): string[] {
// 	return [...new Intl.Segmenter().segment(s)].map((s) => s.segment);
// }
//
// // function *tokenize2(str: string) {
// // 	for (const s of new Intl.Segmenter().segment(str)) yield s.segment;
// // }
//
// function doPatience() {
// 	const diff = patienceDiffPlus(
// 		tokenize(toString(hboUd)),
// 		tokenize(toString(tanachUs)),
// 	);
// 	// const diff = patienceDiffPlus(
// 	// 	tokenize("He found a squirrel, rabbit, and chickin."),
// 	// 	tokenize("He found and ate a squirrel, rabbit, and chicken.")
// 	// )
//
// 	// grapheme similarity (myers)
// 	// word similarity (lcs)
//
// 	for (const o of diff.tokens) {
// 		// if (d.bIndex < 0)
// 		// 	process.stdout.write(chalk.red(d.line))
// 		// else if (d.aIndex < 0)
// 		// 	process.stdout.write(chalk.green(d.line))
// 		// else
// 		// 	process.stdout.write(d.line);
//
// 		if (o.bIndex < 0 && o.moved) {
// 			process.stdout.write(chalk.blackBright(chalk.bgRedBright(o.token)));
// 		} else if (o.moved) {
// 			process.stdout.write(chalk.blackBright(chalk.bgGreenBright(o.token)));
// 		} else if (o.aIndex < 0) {
// 			process.stdout.write(chalk.black(chalk.bgGreen(o.token)));
// 		} else if (o.bIndex < 0) {
// 			process.stdout.write(chalk.black(chalk.bgRed(o.token)));
// 		} else {
// 			process.stdout.write(o.token);
// 		}
// 	}
// 	console.log();
// }
//
// function doMyers() {
// 	const a = tokenize(toString(hboUd));
// 	const b = tokenize(toString(tanachUs));
// 	const diff = calcPatch(a, b);
//
// 	let aPos = 0;
//
// 	for (const d of diff) {
// 		const [aStart, aEnd, bStart, bEnd] = d;
// 		// for context
// 		process.stdout.write(a.slice(aPos, aStart).join(""));
//
// 		process.stdout.write(chalk.black(chalk.bgRed(a.slice(aStart, aEnd).join(""))));
// 		process.stdout.write(chalk.black(chalk.bgGreen(b.slice(bStart, bEnd).join(""))));
//
// 		aPos = aEnd;
// 	}
//
// 	console.log();
// }
//
// function align() {
// 	const aligner = NWaligner();
//
// 	const diff = aligner.align(
// 		tokenize(toString(hboUd).substring(0, 100)),
// 		tokenize(toString(tanachUs).substring(0, 100)),
// 	);
// 	console.log(diff.alignment);
// }
//
// doMyers();
