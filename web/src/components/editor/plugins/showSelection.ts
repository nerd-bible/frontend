import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export default new Plugin({
	props: {
		decorations(state) {
			return state.selection.empty
				? null
				: DecorationSet.create(state.doc, [
						Decoration.inline(state.selection.from, state.selection.to, {
							style: "background:yellow",
						}),
					]);
		},
	},
});
