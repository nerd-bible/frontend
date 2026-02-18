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
			const meta: string = tr.getMeta("annotate");
			if (meta) {
				const { from, to } = tr.selection;
				const deco = Decoration.inline(from, to, { class: meta });
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
