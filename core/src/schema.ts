import type * as z from "@nerd-bible/valio";

function sqliteType(name: string) {
	if (name.startsWith("record<")) return "json";
	switch (name) {
		case "boolean":
		case "string":
			return name;
		case "number":
			return "double";
		case "number|string": return "string";
		case "array":
			return "json";
	}
	throw new Error(`cannot map type ${name}`);
}

export function sqliteCreateTable<T extends Record<any, z.Pipe<any, any>>>(
	tableName: string,
	type: z.ValioObject<T>,
) {
	let res = `create table ${tableName} (`;
	for (const [k, v] of Object.entries(type.shape)) {
		res += `\n${k} ${sqliteType(v.o.name)},`;
	}
	res = res.substring(0, res.length - 1);
	res += "\n);";
	return res;
}
// import { default as bible } from "./conllu/index.ts";
// import { ids } from "./book";
// import { readFileSync } from "node:fs";
// import { intId, primitive } from "./conllu/parsers/normal";
// import { uposs } from "./conllu/literals";
// import { zDeprel } from "./conllu/parsers/strict";
//
// export const writingMeta = z.object({
// 	id: z.string(),
// 	name: z.string(),
// 	book: z.enum(ids),
// 	published: z.date(),
// 	publishedEnd: z.date(),
// 	notes: z.string(),
// });
//
// export const writing = z.object({
// 	/**
// 	 * For searching and rendering. For a Protestant English translation this
// 	 * is about 5 MB.
// 	 */
// 	plaintext: z.string(),
// 	paragraphs: z.object({
// 		offsets: z.array(z.int()),
// 		classes: z.array(z.string()),
// 	}),
// 	sentences: z.object({
// 		offsets: z.array(z.int()),
// 		ids: z.array(z.string()),
// 	}),
// 	headings: z.object({
// 		offsets: z.array(z.int()),
// 		classes: z.array(z.enum(["h1", "h2", "h3", "h4", "h5", "h6"])),
// 		text: z.array(z.string()),
// 	}),
// 	refs: z.object({
// 		offsets: z.array(z.int()),
// 		chapters: z.array(z.int()),
// 		verses: z.array(z.int()),
// 	}),
// });

// export const morpheme = z.object({
// 	order: z.number(),
// 	lemma: z.string(),
// 	upos: z.string(),
// 	xpos: z.string(),
// feats: z.array(z.record(z.string(), primitive)),
// heads: z.array(intId),
// deprels: z.array(zDeprel),
// deps: z.array(z.record(intId, zDeprel)),
// miscs: z.array(z.record(z.string(), primitive)),
// });

// artifact?
/** For artifacts */
// discovered: z.date(),

// const test = readFileSync("./test/bsb.conllu", "utf8");
// const parsed = bible.parse(test);
// console.log(parsed.issues);
// console.log(parsed.sentences.map(s => s.header))
// console.dir(parsed.sentences, { depth: null })

// const collation = z.object({
// 	book: z.string(),
// 	order: z.string(),
// 	variant: z.string(),
// 	properNoun: z.string(),
// 	speaker: z.string(),
// });
//
// const source = z.object({
// 	name: z.string(),
// 	order: z.int32(),
// 	book: z.string(),
// 	text: z.string(),
// 	strongs: z.int32(),
// 	parsing: z.string(),
// 	gloss: z.string(),
// 	chapter: z.int32(),
// 	verse: z.int32(),
// 	collationOrder: z.int32().register(reg, { fk: collation.order }),
// });
