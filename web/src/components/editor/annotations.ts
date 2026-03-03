import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const key = new PluginKey("annotate");

export default new Plugin({
	key,
	state: {
		init() {
			return DecorationSet.empty;
		},
		apply(tr, old) {
			old = old.map(tr.mapping, tr.doc);
			const className: string = tr.getMeta("annotate");
			if (className) {
				const { from, to } = tr.selection;
				const deco = Decoration.inline(from, to, { class: className });
				old = old.add(tr.doc, [deco]);
			}
			return old;
		},
	},
	props: {
		decorations(state) {
			return this.getState(state);
		},
	},
});
