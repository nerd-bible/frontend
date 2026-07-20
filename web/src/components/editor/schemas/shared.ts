import {
	Plot,
	Node,
	Mark,
	parse,
	Leaf,
	Elt,
	ValidationError,
} from "wordgard/doc";
import {
	blockDoc,
	blockquote,
	bulletList,
	color,
	heading,
	lineBreak,
	orderedList as wOrderedList,
	paragraph as wParagraph,
	superscript,
} from "wordgard/schema";
import { GardState } from "wordgard/state";

const Section = Plot.Type.define<string>("Section", {
	blockContent: Node.Group.Content,
	group: Node.Group.Content,
	shape: {
		element: "section",
		readElement: (e) => e.className,
		attributes: (a) => ({ class: a }),
	},
});

export function section() {
	return [GardState.schemaElement.of(Section)];
}

const Paragraph = Plot.Type.define<string>("AltP", {
	inlineContent: true,
	group: Node.Group.Content,
	defaultBlock: true,
	parseRules: [
		{
			selector: "div[role='paragraph']",
			readElement: (ele) => ele.className,
		},
		{
			selector: "p",
			readElement: (ele) => ele.className,
		},
	],
	shape: {
		element: "div",
		attributes: (className) => ({
			class: className,
			role: "paragraph",
		}),
	},
});

export function paragraph() {
	return [
		GardState.schemaElement.of(Paragraph),
		wParagraph.button,
		wParagraph.keyBinding,
	];
}

const BlockFragment = Plot.Type.define<string>("Fragment", {
	defaultParam: "",
	blockContent: Node.Group.Content,
	group: Node.Group.Content,
	shape: {
		element: "div",
		readElement: (elt) => {
			console.log("good", elt);
			if (elt.role == "paragraph") return parse.Reject;
			return elt.className;
		},
		attributes: (n) => ({ class: n }),
	},
	autoJoin: true,
});

export function blockFragment() {
	return [GardState.schemaElement.of(BlockFragment)];
}

const VerseNum = Plot.define("VerseNum", {
	inline: true,
	inlineContent: true,
	defining: true,
	// parseRules: [{
	// 	selector: "sup",
	// }],
	// validate: (value) => {
	// 	const re = /\d+/;
	// 	console.log("VALIDATE", value);
	// 	if (!re.test(value))
	// 		throw new ValidationError(`Invalid verse number: ${value}`);
	// },
	shape: { element: "sup" },
});

// const InlineFragment = Plot.define("Fragment", {
//   inline: true,
//   shape: {element: "span"},
//   inlineContent: true
// })

export function verseNum() {
	return superscript();
	// return [
	// 	GardState.schemaElement.of(InlineFragment),
	// 	// superscript.button,
	// 	// superscript.keyBinding,
	// ];
}
