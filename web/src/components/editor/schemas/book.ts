import { Correction } from "wordgard/state";
import { chapter } from "./chapter.ts";
import {
	blockFragment,
	blockquote,
	blockDoc,
	heading,
	lineBreak,
	paragraph,
	div,
	Doc,
	Heading,
} from "./common.ts";
import { superscript } from "wordgard/schema";
import { Leaf, Plot, Pos } from "wordgard/doc";

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

const ensureTitle = Correction.onChildList(Doc, ({ node }) => {
	let first = node.content[0].tag;
	if (first.is(Heading) && first.param == 1) return null;
	return {
		from: 0,
		insert: [Heading.of(1).create([Leaf.Text.of("Book title")])],
	};
});

function getChapterNumber(heading: Plot | null) {
	if (heading?.tag.is(Heading) && heading.tag.param == 2) {
		const text = heading.textContent();
		const match = text.match(/\d+/);
		if (match) return Number.parseInt(match[0]);
	}
}

const correctChapters = Correction.onContent(Heading, (heading) => {
	if (!heading.node.tag.is(Heading) || heading.node.tag.param != 2) return null;

	const n = getChapterNumber(heading.node);
	if (n?.toString() != heading.node.textContent()) {
		for (let i = heading.index - 1; i > 0; i--) {
			const prevN = getChapterNumber(heading.parent?.node.content[i] as Plot);
			if (prevN) return {
				from: heading.start,
				to: heading.end,
				insert: [Leaf.Text.of((prevN + 1).toString())],
			};
		}
		return {
			from: heading.start,
			to: heading.end,
			insert: [Leaf.Text.of(n?.toString() ?? "1")],
		};
	}
	return null;
});

export default [
	blockDoc(),
	blockFragment(),
	paragraph(),
	// chapter(),
	verseNum(),
	heading(),
	blockquote(),
	lineBreak(),
	div(),
	// corrections
	ensureTitle,
	correctChapters,
];
