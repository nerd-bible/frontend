import { Plot, Node, Mark, parse, Leaf } from "wordgard/doc";
import {
	blockDoc,
	blockquote,
	color,
	heading,
	lineBreak,
	orderedList,
	paragraph,
	superscript,
} from "wordgard/schema";
import { GardState } from "wordgard/state";

// const Aside = Plot.define("Aside", {
// 	blockContent: Node.Group.Content,
// 	group: Node.Group.Content,
// 	shape: { element: "aside" },
// });

export const Paragraph = Plot.define("Paragraph", {
	inlineContent: true,
	group: G.Content,
	defaultBlock: true,
	shape: {element: "p"}
})

const VerseNum = Leaf.Type.define("VerseNum", {
	inline: true,
	shape: {
		element: "sup",
		attributes: n => ({ "data-n": n }),
		readElement: elt => elt.innerHTML,
		// structure() {
		// }
	},
	selectable: true,
});

function verseNum() {
	return [
		GardState.schemaElement.of(VerseNum),
		// superscript.button,
		// superscript.keyBinding,
	];
}

export default [
	blockDoc(),
	verseNum(),
	color(),
	paragraph(),
	heading(),
	blockquote(),
	orderedList(),
	lineBreak(),
];
