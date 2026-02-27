// We cannot use @prosemirror-adapter because overriding `stopEvent` and
// `update` with context from the component are too difficult.
//
// Downside is we don't get nice svelte templates and CSS.
import { StepMap } from "prosemirror-transform";
// import { keymap } from "prosemirror-keymap";
// import { undo, redo } from "prosemirror-history";
import { EditorView, type NodeView } from "prosemirror-view";
import { EditorState, Transaction } from "prosemirror-state";
import type { Node } from "prosemirror-model";

export default class FootnoteView implements NodeView {
	node: Node;
	outerView: EditorView;
	innerView: EditorView | null;
	dom: HTMLElement;
	getPos: () => number | undefined;

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
		if (this.innerView) this.close();
	}

	open() {
		let tooltip = this.outerView.dom.appendChild(document.createElement("div"));
		tooltip.className = "tooltip";
		this.innerView = new EditorView(tooltip, {
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
			handleDOMEvents: {
				mousedown: () => {
					// Kludge to prevent issues due to the fact that the whole
					// footnote is node-selected (and thus DOM-selected) when
					// the parent editor is focused.
					if (this.outerView.hasFocus()) this.innerView?.focus();
				},
			},
			editable: () => this.outerView.editable,
		});
	}

	close() {
		this.innerView?.destroy();
		this.innerView = null;
		this.dom.textContent = "";
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

	destroy() {
		if (this.innerView) this.close();
	}

	stopEvent(event: Event) {
		return this.innerView?.dom.contains(event.target as any) ?? false;
	}

	ignoreMutation() {
		return true;
	}
}
