import { Plot, Node, Leaf, Elt } from "wordgard/doc";
import {
	blockDoc,
	blockquote,
	bulletList,
	heading,
	lineBreak,
	paragraph as wParagraph,
} from "wordgard/schema";
import { GardState } from "wordgard/state";
import {
	Command,
	listIsActive,
	Menu,
	setTextblockType,
	toggleList,
} from "wordgard/command";
import { phrases } from "wordgard/phrases";
import { blockFragment, section, verseNum } from "./shared";
import { InputRule, KeyBinding } from "wordgard/editor";

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

const Paragraph = Plot.Type.define("Paragraph", {
	defaultParam: "",
	inlineContent: true,
	group: Node.Group.Content,
	defaultBlock: true,
	parseRules: [
		{ selector: "div[role='paragraph']", readElement: (e) => e.className },
		{ selector: "p", readElement: (e) => e.className },
	],
	shape: {
		structure: c => Elt.mk("div", { role: "paragraph", class: c }, [0]),
		atom: false,
	},
});

function paragraph() {
	return [
		GardState.schemaElement.of(Paragraph),
		Menu.Button.define({
			run: Command.bind(setTextblockType, Paragraph.default!),
			active: selectionInType(Paragraph.default!),
			label: phrases.ref("paragraph"),
			enable: (s) => !s.readOnly,
			parent: Menu.Submenu.textblockStyle,
			rank: 10,
		}),
		KeyBinding.of({
			key: "Ctrl-Shift-0",
			run: Command.bind(setTextblockType, Paragraph.default!),
		}),
	];
}

const InlineListItem = Plot.define("ListItem", {
	inline: true,
	inlineContent: [Leaf.Text],
	shape: { element: "li" },
	defining: true,
});

const Ul = Plot.Type.define("Ul", {
	inline: true,
	inlineContent: [InlineListItem, Leaf.Text],
	role: Node.Role.List,
	defining: true,
	shape: {
		element: "ul",
		readElement: (elt) => elt.className,
		attributes: (c) => ({ class: c }),
	},
	autoJoin: true,
});

function ul() {
	return [
		GardState.schemaElement.of(Ul),
		GardState.schemaElement.of(InlineListItem),
		bulletList.toggleButton,
		bulletList.createOnDash,
	];
}

const Ol = Plot.Type.define("Ol", {
	defaultParam: 1,
	validate: "number",
	inline: true,
	inlineContent: [InlineListItem, Leaf.Text],
	role: Node.Role.List,
	defining: true,
	shape: {
		element: "ol",
		attributes: (start) =>
			start == 1 ? ({} as Record<string, string>) : { start: String(start) },
		readElement: (elt) => Number(elt.getAttribute("start") || "1"),
	},
	autoJoin: (_a, b) => b.param == 1,
});

function ol() {
	return [
		GardState.schemaElement.of(Ol),
		InputRule.wrapping(/^ ?(\d+)\. $/, (match) => Ol.of(+match[1]!.text), true),
		Menu.Button.define({
			run: Command.bind(toggleList, Ol.default!),
			active: listIsActive(Ol.default!),
			label: {
				icon: "M34 75a3 3 0 0 1 0-6h56a3 3 0 0 1 0 6h-56m0-25a3 3 0 0 1 0-6h56a3 3 0 0 1 0 6h-56m0-25a3 3 0 0 1 0-6h56a3 3 0 0 1 0 6h-56M11 74v-3H13c1 0 2-1 2-2 0-1-1-2-2-2-1 0-2 1-2 2h-4c0-3 2-5 6-5 4 0 6 2 6 4a4 4 0 0 1-3 4v0a4 4 0 0 1 4 4c0 3-3 5-7 5-4 0-6-2-6-5h4c0 1 1 2 3 2 2 0 3-1 3-2 0-1-1-2-3-2h-2zm0-29h-4v0c0-3 2-5 6-5 4 0 6 2 6 5 0 2-2 4-3 5l-3 4h7V57H7v-3l6-6c1-1 2-2 2-3 0-1-1-2-2-2a2 2 0 0 0-2 2zM16 31h-4V18h0l-4 3v-4l4-3h4z",
				directional: true,
			},
			description: phrases.ref("toggle_ordered_list"),
			enable: (s) => !s.readOnly,
			parent: Menu.Group.block,
			rank: 30,
		}),
	];
}

export default [
	blockDoc(),
	blockFragment(),
	paragraph(),
	// wParagraph(),
	section(),
	verseNum(),
	heading(),
	blockquote(),
	ul(),
	ol(),
	lineBreak(),
];
