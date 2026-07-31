import { Node, Plot, parse, Leaf, Elt } from "wordgard/doc";
import { GardState } from "wordgard/state";
import {
	Decoration,
	PointSet,
	RangeSet,
	Widget,
	Wordgard,
} from "wordgard/editor";
import { Command, Menu } from "wordgard/command";

export const Chapter = Leaf.Type.define<number | null>("Chapter", {
	defaultParam: null,
	group: Node.Group.Content,
	shape: {
		element: "h2",
		readElement: (elt) => {
			const match = (elt as HTMLElement).innerText.match(/\d+/);
			if (match) {
				console.log(match);
				return Number.parseInt(match[0]);
			}
			return null;
		},
		attributes: (n) =>
			n != null ? { start: n.toString() } : ({} as Record<string, string>),
		atom: true,
	},
	selectable: true,
});

const inputWidget = Widget.define<number | null>({
	render(v) {
		const h2 = document.createElement("h2");
		const input = h2.appendChild(document.createElement("input"));
		input.type = "number";
		if (v != null) input.valueAsNumber = v;
		input.addEventListener("beforeinput", function (ev) {
			ev.preventDefault();
		});
		return h2;
	},
	handleEvent(event, wg) {
		console.log("handle", event);
		return true;
	},
});

const inputShape = Decoration.Tag.shape(
	Chapter,
	tag => inputWidget.of(tag.param),
	{ atom: false },
);

export const editor: GardState.Extension = [
	// inputShape,
	// Wordgard.domEventHandler("input", (ev) => {
	// 		console.log("EVENT", ev);
	// }),
	// inputField,
	// linkTooltipTheme,
];


export function chapter() {
	return [GardState.schemaElement.of(Chapter), editor,

	];
}
