import { ChangeSet, Leaf, Plot, Schema } from "wordgard/doc";
import {
	Paragraph,
	Doc,
	Heading,
	Blockquote,
	LineBreak,
	HorizontalRule,
	Strong,
} from "wordgard/types";

export const basicSchema = Schema.define([
	Doc,
	Paragraph,
	Heading,
	Blockquote,
	LineBreak,
	HorizontalRule,
	Strong,
]);

const doc = basicSchema.doc([
	Paragraph.create([Leaf.text("Starting content")]),
]);

console.log(doc.toString());

const changes = [
	{ from: 1, to: 2 },
	{
		from: 1,
		insert: [Leaf.text("meadow ")],
	},
	{
		from: 1,
		to: 5,
		insert: [Leaf.text("...")],
	},
	[
		{ from: 1, insert: [Leaf.text("(")] },
		{ from: 5, insert: [Leaf.text(")")] },
	],
	{
		from: 2,
		insert: [Plot.End, Paragraph],
	},
	{
		from: 1,
		to: 5,
		add: Strong,
	},
];

for (const c of changes) {
	console.log(c);
	const cs = ChangeSet.create(doc, c);
	console.dir(cs.toJSON(), { depth: null });
	console.log(cs.apply(doc).toString());
	console.log();
}
