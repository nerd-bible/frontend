import { Correction, GardSelection, GardState } from "wordgard/state";
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
	punctCorrections,
} from "./common.ts";
import { ChangeSet, Leaf, Plot } from "wordgard/doc";
import { InputRule, KeyBinding } from "wordgard/editor";
import { Command, Menu } from "wordgard/command";
import { history } from "wordgard/history";
import { patterns } from "@nerd-bible/ref";
import { calcPatch, calcSlices, diff } from "fast-myers-diff";

const VerseNum = Plot.define("VerseNum", {
	inline: true,
	inlineContent: Leaf.Text,
	preserveWhitespace: true,
	// isolating: true,
	defining: true,
	shape: {
		element: "sup",
		attributes: { spellcheck: "false" },
		// structure: () => Elt.mk("sup", { spellcheck: "false" }, [0, " "]),
		// atom: false,
	},
	// parseRules: [
	// 	{ selector: "sup" },
	// ],
});

// const supWidget = Widget.define<string>({
// 	render(v) {
// 		let s = document.createElement("sup");
// 		s.textContent = v;
// 		return s;
// 	},
// });
// const VerseNumAppendSpace = Decoration.Tag.widget(VerseNum, "after", supWidget.of(" "));

// export const VerseNum = Mark.define("VerseNum", {
// 	rank: 45,
// 	shape: { element: "sup" },
// 	// inclusive: false,
// });

const verseRegex = new RegExp(patterns.verse);
const verseRegexSpace = new RegExp("^ " + verseRegex.source + " $");
const verseRegexInput = new RegExp(
	String.raw`(\^|\\?v\s*)` + verseRegex.source + " ",
);

// function getVerseNumber(plot: Plot | null) {
// 	if (plot?.tag.is(VerseNum.type)) {
// 		const text = plot.textContent();
// 		const match = text.match(verseRegex);
// 		if (match) return Number.parseInt(match[1] ?? match[0]);
// 	}
// 	if (plot?.tag.is(Heading) && plot.tag.param == 2) return 0;
// 	return null;
// }

function verseToInsert(state: GardState) {
	const { selection, doc, sel } = state;

	if (
		sel.from.parent.node == sel.to.parent.node &&
		doc.schema.canContain(sel.from.parent.node.type, VerseNum.type)
	) {
		if (selection.isCursor) return true;
		const text = doc.textContent({
			from: selection.from,
			to: selection.to,
			leafText: "?",
		});
		if (verseRegex.test(text)) return text;
	}
}

export const insertVerse: Command = (wg) => {
	const { selection } = wg.state;

	const toWrap = verseToInsert(wg.state);
	if (typeof toWrap === "string")
		return {
			changes: {
				from: selection.from,
				to: selection.to,
				insert: [VerseNum.create([Leaf.text(toWrap)])],
			},
		};
	else if (toWrap) {
		// TODO: iterate backwards thru doc looking for closest verse or chapter
		// number and increment
		const num = "1";
		return {
			changes: {
				from: selection.from,
				to: selection.to,
				insert: [VerseNum.create([Leaf.text(num)])],
			},
			selection: (cx, changes) =>
				GardSelection.near(cx, changes.mapPos(selection.to, 1), -1),
		};
	}
	return false;
};

export function verseNum() {
	return [
		GardState.schemaElement.of(VerseNum),
		InputRule.define({
			expr: verseRegexInput,
			apply(state, matches) {
				const m = matches[0];
				let changes = ChangeSet.create(state.doc, {
					from: m.from.pos,
					to: m.to.pos,
					insert: [VerseNum.create([Leaf.text(m.text.substring(1))])],
					fit: true,
				});
				let ele = changes.findInserted((t) => t == VerseNum);
				if (ele == null) return null;
				return {
					changes,
					selection: (cx) => GardSelection.near(cx, ele + m.text.length, 1),
					annotations: history.isolate.of(true),
					userEvent: "insert.verseNum",
				};
			},
		}),
		KeyBinding.of({ key: "Mod-.", run: insertVerse }),
		// Menu.Button.toggleMark({
		// 	mark: VerseNum,
		// 	parent: Menu.Group.inline,
		// 	rank: 70,
		// 	description: () => "Toggle Verse number",
		// 	label: {
		// 		icon: "m27 78 6-18H55l6 18H69L48 19H40L19 78zm17-50 9 26h-18l9-26zm32-11v0c4 -10 12 0 5 6l-11 11V38h22v-6h-12v0l6-6c3-3 5-5 5-10 0-5-4-9-11-9C72 6 69 11 69 16v0z",
		// 	},
		// }),
		Menu.Button.define({
			run: insertVerse,
			enable: (s) => !s.readOnly && Boolean(verseToInsert(s)),
			parent: Menu.Group.insert,
			description: () => "Insert verse number",
			label: {
				icon: "m27 78 6-18H55l6 18H69L48 19H40L19 78zm17-50 9 26h-18l9-26zm32-11v0c4 -10 12 0 5 6l-11 11V38h22v-6h-12v0l6-6c3-3 5-5 5-10 0-5-4-9-11-9C72 6 69 11 69 16v0z",
			},
		}),
	];
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
		if (text == "") return text;
		const match = text.match(/\d+/);
		if (match) return Number.parseInt(match[0]);
	}
}

export const correctChapters = Correction.onContent(Heading, (heading) => {
	if (!heading.node.tag.is(Heading) || heading.node.tag.param != 2) return null;

	const n = getChapterNumber(heading.node);
	if (n?.toString() != heading.node.textContent()) {
		for (let i = heading.index - 1; i > 0; i--) {
			const prevN = getChapterNumber(heading.parent?.node.content[i] as Plot);
			if (prevN)
				return {
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

export const correctVerseNum = Correction.onContent(VerseNum, (node) => {
	const changes: ChangeSet.Spec[] = [];
	const content = node.node.textContent();

	if (!verseRegexSpace.test(content)) {
		const replacement = " " + content.replace(/[^\d]/g, "") + " ";
		// "12a3" -> "123 "
		for (const [sx, ex, sy, ey] of diff(content, replacement))
			changes.push({
				from: node.start + sx,
				to: node.start + ex,
				insert: [Leaf.Text.of(replacement.substring(sy, ey))],
			});
	}
	return changes;
});

export default [
	blockDoc(),
	blockFragment(),
	paragraph(),
	verseNum(),
	heading(),
	blockquote(),
	lineBreak(),
	div(),
	// corrections
	punctCorrections,
	ensureTitle,
	correctChapters,
	correctVerseNum,
];
