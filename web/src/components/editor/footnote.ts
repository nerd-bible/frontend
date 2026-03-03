import { StepMap } from "prosemirror-transform";
// import { keymap } from "prosemirror-keymap";
// import { undo, redo } from "prosemirror-history";
import { EditorView, type NodeView } from "prosemirror-view";
import { EditorState, PluginKey, Plugin, Transaction, TextSelection } from "prosemirror-state";
import type { Node } from "prosemirror-model";
import { updatePositionFactory } from "./tooltip";
import { autoUpdate } from "@floating-ui/dom";
import "./footnote.css";

class FootnoteView implements NodeView {
	node: Node;
	outerView: EditorView;
	innerView: EditorView | null;
	tooltip?: HTMLElement;
	dom: HTMLElement;
	getPos: () => number | undefined;
	/** Stop updating tooltip position */
	cleanup = () => {};

	constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
		this.node = node;
		this.outerView = view;
		this.getPos = getPos;
		this.dom = document.createElement("sup");
		this.dom.classList.add("footnote");
		this.innerView = null;
	}

	selectNode() {
		this.dom.classList.add("ProseMirror-selectednode");
		if (!this.innerView) this.open();
	}

	deselectNode() {
		this.dom.classList.remove("ProseMirror-selectednode");
		if (this.innerView) this.destroy();
	}

	open() {
		this.tooltip = this.dom.appendChild(document.createElement("div"));
		this.tooltip.classList.add("tooltip");
		this.tooltip.dir = "auto";
		this.innerView = new EditorView(this.tooltip, {
			state: EditorState.create({
				doc: this.node,
				// plugins: [
				// 	keymap({
				// 		"Mod-z": () => undo(this.outerView.state, this.outerView.dispatch),
				// 		"Mod-y": () => redo(this.outerView.state, this.outerView.dispatch),
				// 	}),
				// ],
			}),
			dispatchTransaction: this.dispatchInner.bind(this),
			// handleDOMEvents: {
			// 	mousedown: () => {
			// 		if (this.outerView.hasFocus()) this.innerView?.focus();
			// 	},
			// },
			editable: () => this.outerView.editable,
		});

		const { reference, update } = updatePositionFactory(
			this.outerView,
			this.outerView.state.selection,
			this.tooltip,
		);
		this.cleanup();
		this.cleanup = autoUpdate(reference, this.tooltip, update);
	}

	destroy() {
		this.innerView?.destroy();
		this.innerView = null;
		this.tooltip?.remove();
		this.cleanup();
	}

	dispatchInner(tr: Transaction) {
		if (!this.innerView) return;

		const { state, transactions } = this.innerView.state.applyTransaction(tr);
		this.innerView.updateState(state);

		if (!tr.getMeta("fromOutside")) {
			let outerTr = this.outerView.state.tr,
				offsetMap = StepMap.offset(this.getPos()! + 1);
			for (let i = 0; i < transactions.length; i++) {
				let steps = transactions[i].steps;
				for (let j = 0; j < steps.length; j++)
					outerTr.step(steps[j].map(offsetMap)!);
			}
			if (outerTr.docChanged) this.outerView.dispatch(outerTr);
		}
	}

	update(node: Node) {
		if (!node.sameMarkup(this.node)) return false;
		this.node = node;
		if (!this.innerView) return true;

		let state = this.innerView.state;
		let start = node.content.findDiffStart(state.doc.content);
		if (start != null) {
			const diff = node.content.findDiffEnd(state.doc.content);
			if (!diff) return true;

			let { a: endA, b: endB } = diff;
			let overlap = start - Math.min(endA, endB);
			if (overlap > 0) {
				endA += overlap;
				endB += overlap;
			}
			this.innerView.dispatch(
				state.tr
					.replace(start, endB, node.slice(start, endA))
					.setMeta("fromOutside", true),
			);
		}
		return true;
	}

	stopEvent(event: Event) {
		return this.innerView?.dom.contains(event.target as any) ?? false;
	}

	ignoreMutation() {
		return true;
	}
}

export const key = new PluginKey("footnote");
export default new Plugin({
	key,
	props: {
		nodeViews: {
			footnote: (node, view, getPos) => new FootnoteView(node, view, getPos),
		},
	},
});
