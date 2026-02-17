import { Plugin, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet, type NodeView } from "prosemirror-view";
import { DOMSerializer, type Node as PmNode } from "prosemirror-model";

function getDecorations(doc: PmNode) {
	const decos: Decoration[] = [];
	decos.push(Decoration.inline(0, 130, { class: "red" }, { type: "userHighlight" }));
	return DecorationSet.create(doc, decos);
}

export default new Plugin({
	state: {
		init(_, { doc }) {
			return getDecorations(doc);
		},
		apply(tr, old) {
			if (tr.docChanged) return getDecorations(tr.doc);
			// TODO: fix after adding versioning
			return old.map(tr.mapping, tr.doc);
		},
	},
	props: {
		decorations(state) {
			return this.getState(state);
		},
		// No annotating verse or chapter numbers because they aren't semantic.
		nodeViews: {
			// text(
			//  	node,
			//  	_view,
			//  	_getPos,
			//  	decorations,
			//  	innerDecorations,
			// ) {
			// 	if (decorations.length) console.log(arguments);
			// 	return document.createTextNode(node.textContent);
			// },
			// verseNum(
			// 	node,
			// 	_view,
			// 	_getPos,
			// 	decorations,
			// 	innerDecorations,
			// ) {
			// 	if (decorations.length) console.log(decorations);
			// 	const { dom } = DOMSerializer.renderSpec(document, node.type.spec.toDOM!(node), null);
			// 	return { dom };
			// },
			// chapterNum(node) {
			// 	// don't include contentDom
			// 	const { dom } = DOMSerializer.renderSpec(document, node.type.spec.toDOM!(node), null);
			// 	dom.textContent = node.textContent;
			// 	return { dom };
			// },
		},
	},
});
