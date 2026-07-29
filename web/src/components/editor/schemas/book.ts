import { Plot, ValidationError } from "wordgard/doc";
import { GardState } from "wordgard/state";
import {
	blockFragment,
	chapter,
	blockquote,
	blockDoc,
	heading,
	lineBreak,
	paragraph,
    div,
} from "./common.ts";
import { superscript } from "wordgard/schema";

// const VerseNum = Plot.define("VerseNum", {
// 	inline: true,
// 	inlineContent: true,
// isolating: true,
// 	parseRules: [
// 		{
// 			selector: "sup",
// 		},
// 	],
// 	validate: (value) => {
// 		const re = /\d+/;
// 		console.log("VALIDATE", value);
// 		if (!re.test(value as any))
// 			throw new ValidationError(`Invalid verse number: ${value}`);
// 	},
// 	shape: { element: "sup" },
// });

export function verseNum() {
	return superscript();
	// return [
	// 	GardState.schemaElement.of(VerseNum),
	// ];
}

export default [
	blockDoc(),
	blockFragment(),
	paragraph(),
	chapter(),
	verseNum(),
	heading(),
	blockquote(),
	lineBreak(),
	div(),
];
