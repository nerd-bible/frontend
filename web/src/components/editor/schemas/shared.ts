import { phrases } from "wordgard/phrases";
import { Command, Menu, toggleBlock } from "wordgard/command";
import {
	Plot,
	Node,
	Mark,
	parse,
	Leaf,
	Elt,
	ValidationError,
	Pos,
} from "wordgard/doc";
import { InputRule } from "wordgard/editor";
import {
	blockDoc,
	bulletList,
	color,
	heading,
	lineBreak,
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

const Blockquote = Plot.define("Blockquote", {
	blockContent: Node.Group.Content,
	group: Node.Group.Content,
	shape: { element: "blockquote" },
	autoJoin: true,
});

export function blockquote() {
	return [
		GardState.schemaElement.of(Blockquote),
		Menu.Button.define({
			run: Command.bind(toggleBlock, Blockquote),
			active: (state) => {
				for (
					let cur: Pos.Node | null = state.sel.head.parent;
					cur;
					cur = cur.parent
				)
					if (cur.node.type == Blockquote.type) return true;
				return false;
			},
			label: {
				icon: "M75 75a6 6 0 0 0 6-6V53a6 6 0 0 0-6-6h-9q0-3 0-7 1-3 2-6t3-4q2-2 5-2V19q-5 0-9 2a21 21 0 0 0-7 6 31 31 0 0 0-4 9A48 48 0 0 0 56 47V69a5 5 0 0 0 6 6zm-37 0a6 6 0 0 0 6-6V53a6 6 0 0 0-6-6H29q0-3 0-7 1-3 2-6 1-3 3-4 2-2 5-2V19q-5 0-9 2a21 21 0 0 0-7 6 31 31 0 0 0-4 9A48 48 0 0 0 19 47V69a6 6 0 0 0 6 6z",
			},
			description: phrases.ref("toggle_quote"),
			enable: (s) => !s.readOnly,
			parent: Menu.Group.block,
			rank: 40,
		}),
		InputRule.wrapping(/^> $/, Blockquote, true),
		// Wordgard.theme({
		//   blockquote: {
		//     marginInline: "3px",
		//     paddingInlineStart: "12px",
		//     borderInlineStart: "4px solid silver"
		//   }
		// })
	];
}
