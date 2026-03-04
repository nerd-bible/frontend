import { Schema } from "prosemirror-model";

export const bible = new Schema({
	nodes: {
		doc: {
			content: "block+",
		},
		// blocks
		paragraph: {
			group: "block",
			content: "inline*",
			attrs: { class: {} },
			/*
			 * Copy/pasting inline elements that may contain block elements (like
			 * footnotes) does not work if implicit closing tags (`p`, `li`, `dt`,
			 * `dd`, `tbody`, `thead`, `tfoot`, `tr`, `th`, `td`) may be contained by
			 * this selector.
			 *
			 * https://discuss.prosemirror.net/t/pasting-footnotes-with-content/2479/5
			 */
			toDOM: (node) => ["p", node.attrs, 0],
		},
		chapterNum: {
			group: "block",
			// This avoids chapter numbers being decorated.
			toDOM: () => ["h2", 0],
		},
		heading: {
			group: "block",
			content: "inline*",
			toDOM: () => ["h3", 0],
		},
		blockquote: {
			group: "block",
			content: "inline*",
			toDOM: () => ["blockquote", 0],
		},
		// inline
		text: {
			group: "inline",
			inline: true,
		},
		verseNum: {
			group: "inline",
			content: "text*",
			inline: true,
			toDOM: (node) => ["sup", { class: "verse-num", dir: "ltr" }, node.textContent],
		},
		// Footnotes are semantically `inline+ block+` where the `inline+` is the
		// content and `block+` is its footnote.
		//
		// For display we just stick to a leaf node because it better matches
		// in-print Bibles and is technically easier. Usually the context of the
		// footnote is usually good enough to resolve the text it's talking about.
		footnote: {
			group: "inline",
			content: "block*",
			inline: true,
			// This makes the view treat the node as a leaf, even though it
			// technically has content
			atom: true,
			toDOM: () => ["sup", { class: "footnote", dir: "ltr" }, 0],
			parseDOM: [{ tag: "sup.footnote" }],
		},
	},
	marks: {
		strong: {
			toDOM: () => ["strong", 0],
		},
		em: {
			toDOM: () => ["em", 0],
		},
		quote: {
			attrs: { speaker: {} },
			toDOM: () => ["q", 0],
		},
	},
});

// const schema = bible;
// import { builders } from "prosemirror-test-builder";
// const { doc, paragraph, chapterNum, verseNum } = builders(schema) as any;
//
// let d: Node = doc(
// 	chapterNum("1"),
// 	paragraph(
// 		verseNum("1"),
// 		"In the beginning, God created the heavens and the earth.",
// 	),
// 	paragraph(
// 		verseNum("2"),
// 		"Now the earthless was formless and void, and darkness was hovering over the surface of the deep.",
// 	),
// );
// // console.dir(d.toJSON(), { depth: null });
// console.dir(d.toJSON(), { depth: null });
// export { d as doc };

// const highlight1 = new AddMarkStep(
// 	40,
// 	140,
// 	schema.marks.highlight.create({ id: "red" }),
// );
// d = highlight1.apply(d).doc!;
// // console.dir(d.toJSON(), { depth: null });
//
// const highlight2 = new AddMarkStep(
// 	50,
// 	150,
// 	schema.marks.highlight.create({ id: "green" }),
// );
// d = highlight2.apply(d).doc!;
// console.dir(d.toJSON(), { depth: null });
//
// const tr = new Transform(d);
// tr.addMark(40, 140, schema.marks.highlight.create({ id: "red" }));
//
// console.dir(d.toJSON(), { depth: null });
