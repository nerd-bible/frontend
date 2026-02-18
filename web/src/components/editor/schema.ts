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
			toDOM: () => ["p", 0],
			parseDOM: [{ tag: "p" }],
		},
		chapterNum: {
			group: "block",
			content: "inline*",
			annotations: "",
			attrs: { id: {} },
			// This avoids chapter numbers being decorated.
			toDOM(node) {
				const res = document.createElement("h2");
				res.textContent = node.textContent;
				res.id = node.attrs["id"];
				return res;
			},
			parseDOM: [{ tag: "h2" }],
			selectable: false,
		},
		heading: {
			group: "block",
			content: "inline*",
			annotations: "",
			toDOM: () => ["h3", 0],
			parseDOM: [{ tag: "h3" }],
		},
		blockquote: {
			group: "block",
			content: "inline*",
			toDOM: () => ["blockquote", 0],
			parseDOM: [{ tag: "blockquote" }],
		},
		// inline
		text: {
			group: "inline",
			inline: true,
		},
		verseNum: {
			group: "inline",
			inline: true,
			marks: "",
			content: "text*",
			attrs: { id: { default: "foo" } },
			toDOM: (node) => ["sup", node.attrs, 0],
			parseDOM: [{ tag: "sup" }],
			selectable: false,
		},
		footnote: {
			group: "inline",
			content: "block+",
			inline: true,
			// This makes the view treat the node as a leaf, even though it
			// technically has content
			atom: true,
			toDOM: () => ["footnote", 0],
			parseDOM: [{ tag: "footnote" }],
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
