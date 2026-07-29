import { phrases } from "wordgard/phrases";
import {
	autoJoinBlocks,
	Command,
	doUnwrapBlock,
	findWrappable,
	Menu,
	setTextblockType,
	splitTextblock,
	toggleBlock,
	unwrapBlock,
	wrapBlock,
	wrapBlockRange,
} from "wordgard/command";
import {
	Plot,
	Node,
	parse,
	Elt,
	ValidationError,
	Pos,
	Leaf,
	ChangeSet,
} from "wordgard/doc";
import { InputRule, KeyBinding } from "wordgard/editor";
import { GardState, Transaction } from "wordgard/state";
import { PhraseSet } from "wordgard/phrases";

export const LineBreak = Leaf.define("LineBreak", {
	inline: true,
	role: Node.Role.LineBreak,
	toText: () => "\n",
	shape: { element: "br" },
});

export function lineBreak(): GardState.Extension {
	return GardState.schemaElement.of(LineBreak);
}

const Chapter = Plot.Type.define("Chapter", {
	defaultParam: "chapter",
	blockContent: Node.Group.Content,
	group: Node.Group.Content,
	shape: {
		element: "section",
		readElement: (e) => e.className,
		attributes: (a) => ({ class: a }),
	},
});

const insertChapter: Command.Pure<Plot.Tag> = ({ state }, wrapper) => {
	let targets: Pos.Node[] = [],
		changes: ChangeSet.Spec[] = [];
	for (let { from, to } of state.selection.ranges) {
		if (!targets.some((t) => t.after > from && t.before < to)) {
			state.doc.iterate(
				state.doc.resolve(from).pos,
				state.doc.resolve(to).pos,
				(node, p, parent) => {
					if (
						node.type.isBlock &&
						node.isPlot &&
						!node.inlineContent &&
						parent &&
						state.schema.matchNode(node.type, wrapper)
					) {
							targets.push(node);
							changes.push(doUnwrapBlock(node, from, to));
					}
				},
			);
		}
	}

    changes.push(wrapBlockRange(range, wrapper))

	return idk;
};

export function chapter() {
	return [
		GardState.schemaElement.of(Chapter),
		Menu.Button.define({
			run: Command.bind(unwrapBlock, Chapter),
			active: selectionInType(Chapter.default!),
			label: "Un",
			enable: (s) => !s.readOnly,
			parent: Menu.Group.block,
			rank: 11,
		}),
		Menu.Button.define({
			run: Command.bind(wrapBlock, Chapter.default!),
			active: (s) => !selectionInType(Chapter.default!)(s),
			label: "Re",
			enable: (s) => !s.readOnly,
			parent: Menu.Group.block,
			rank: 11,
		}),
	];
}

export const Paragraph = Plot.define("Paragraph", {
	inlineContent: true,
	group: Node.Group.Content,
	defaultBlock: true,
	shape: { element: "p" },
});

export function paragraph() {
	return [
		GardState.schemaElement.of(Paragraph),
		KeyBinding.of({
			key: "Ctrl-Shift-0",
			run: Command.bind(setTextblockType, Paragraph),
		}),
		Menu.Button.define({
			run: Command.bind(setTextblockType, Paragraph),
			active: selectionInType(Paragraph),
			label: phrases.ref("paragraph"),
			enable: (s) => !s.readOnly,
			parent: Menu.Submenu.textblockStyle,
			rank: 10,
		}),
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

// const InlineFragment = Plot.define("Fragment", {
//   inline: true,
//   shape: {element: "span"},
//   inlineContent: true
// })

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

export const Heading = Plot.Type.define("Heading", {
	defaultParam: 1,
	validate: (value) => {
		if (
			typeof value != "number" ||
			Math.floor(value) != value ||
			value < 1 ||
			value > 6
		)
			throw new ValidationError(`Invalid heading level: ${value}`);
	},
	inlineContent: true,
	group: Node.Group.Content,
	shape: { structure: (level) => Elt.mk("h" + level, [0]), atom: false },
	defining: true,
	parseRules: [
		{ selector: "h1", param: 1 },
		{ selector: "h2", param: 2 },
		{ selector: "h3", param: 3 },
		{ selector: "h4", param: 4 },
		{ selector: "h5", param: 5 },
		{ selector: "h6", param: 6 },
	],
});

function selectionInType(tag: Plot.Tag) {
	return (state: GardState) => {
		let { sel } = state,
			block = sel.head.textblockParent;
		return (
			!!block &&
			block.start == sel.anchor.textblockParent?.start &&
			block.node.tag.eq(tag)
		);
	};
}

const headingPhrases = PhraseSet.define({
	heading_1: "Heading 1",
	heading_2: "Heading 2",
	heading_3: "Heading 3",
	heading_4: "Heading 4",
	heading_5: "Heading 5",
	heading_6: "Heading 6",
});

export function heading(): GardState.Extension {
	return [
		GardState.schemaElement.of(Heading),
		([1, 2, 3, 4, 5, 6] as const).map((n) =>
			Menu.Button.define({
				run: Command.bind(setTextblockType, Heading.of(n)),
				active: selectionInType(Heading.of(n)),
				label: headingPhrases.ref(`heading_${n}`),
				enable: (s) => !s.readOnly,
				parent: Menu.Submenu.textblockStyle,
				rank: 50 + n,
			}),
		),
		KeyBinding.of({
			key: "Ctrl-Shift-1",
			run: Command.bind(setTextblockType, Heading.of(1)),
		}),
		KeyBinding.of({
			key: "Ctrl-Shift-2",
			run: Command.bind(setTextblockType, Heading.of(2)),
		}),
		KeyBinding.of({
			key: "Ctrl-Shift-3",
			run: Command.bind(setTextblockType, Heading.of(3)),
		}),
		KeyBinding.of({
			key: "Ctrl-Shift-4",
			run: Command.bind(setTextblockType, Heading.of(4)),
		}),
		KeyBinding.of({
			key: "Ctrl-Shift-5",
			run: Command.bind(setTextblockType, Heading.of(5)),
		}),
		KeyBinding.of({
			key: "Ctrl-Shift-6",
			run: Command.bind(setTextblockType, Heading.of(6)),
		}),
		InputRule.textblockType(
			/^(#{1,6}) $/,
			(m) => Heading.of(m[1]!.to.pos - m[1]!.from.pos),
			true,
		),
	];
}

export const Div = Plot.Type.define("Iso", {
	defaultParam: "",
	blockContent: Node.Group.Content,
	group: Node.Group.Content,
	shape: {
		element: "div",
		readElement: (e) => e.className,
		attributes: (a) => ({ class: a }),
	},
});

export function div() {
	return [GardState.schemaElement.of(Div)];
}

export const Doc = Plot.defineDoc({
	blockContent: Node.Group.Content,
});

export function blockDoc(): GardState.Extension {
	return GardState.schemaElement.of(Doc);
}
