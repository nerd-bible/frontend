import {
	computePosition,
	autoUpdate,
	flip,
	offset,
	shift,
	inline,
} from "@floating-ui/dom";
import { EditorView } from "prosemirror-view";
import {
	EditorState,
	Plugin,
	PluginKey,
	TextSelection,
} from "prosemirror-state";
import type { PluginView } from "prosemirror-state";

class SelectionTooltipPlugin implements PluginView {
	view: EditorView;
	/** The tooltip */
	target: HTMLElement;
	/** Stop updating tooltip position */
	cleanup = () => {};
	/** Don't show tooltip until mouseup */
	maybeSelecting = false;

	mousedown: (ev: MouseEvent) => void;
	mouseup: (ev: MouseEvent) => void;
	selectionchange: () => void;

	selectedState?: EditorState;

	constructor(view: EditorView, target: HTMLElement) {
		this.view = view;
		this.target = target;

		this.mousedown = (ev: MouseEvent) => {
			if (!this.target.contains(ev.target as any)) this.close();
			this.maybeSelecting = true;
		};
		this.mouseup = () => {
			this.maybeSelecting = false;
			if (this.selectionInView()) this.update();
		};
		this.selectionchange = () => {
			// Workaround Chrome issue:
			// https://github.com/ProseMirror/prosemirror/issues/1563
			if (!this.selectionInView()) {
				const { doc } = this.view.state;
				const atStart = TextSelection.between(doc.resolve(0), doc.resolve(0));
				const tr = this.view.state.tr.setSelection(atStart);
				this.view.dispatch(tr);
			}
		};
		document.addEventListener("mousedown", this.mousedown);
		document.addEventListener("mouseup", this.mouseup);
		document.addEventListener("selectionchange", this.selectionchange);

		this.close();
		// this.target.addEventListener("click", () => {
		// 	// Sometimes prosemirror:
		// 	// 1. Keeps current selection
		// 	// 2. Clears current selection
		// 	// 3. Snaps current selection somewhat randomly
		// 	// ...so let's just clear it and hide ourselves.
		// 	// this.close();
		// 	// document.getSelection()?.removeAllRanges();
		// 	this.view.focus();
		// });
	}

	selectionInView() {
		const s = document.getSelection();
		return this.view.dom.contains(s?.anchorNode ?? null);
	}

	update(view = this.view) {
		this.view = view;
		const { state } = view;

		if (
			(this.selectedState?.doc.eq(state.doc) &&
				this.selectedState.selection.eq(state.selection)) ||
			this.maybeSelecting ||
			state.selection.empty
		) {
			this.close();
			return;
		}

		const { from, to } = state.selection;
		const reference = {
			getBoundingClientRect: () => {
				const start = this.view.coordsAtPos(from, -1);
				const end = this.view.coordsAtPos(to, -1);
				const rect = new DOMRect(
					start.left,
					start.top,
					end.right - start.left,
					end.bottom - start.top,
				);
				return rect;
			},
			// Support floating-ui's `inline`
			getClientRects: () => {
				const start = this.view.coordsAtPos(from, -1);
				const end = this.view.coordsAtPos(to, -1);
				return [
					new DOMRect(start.left, start.top, 1, start.bottom - start.top),
					new DOMRect(end.left, end.top, 1, end.bottom - end.top),
				];
			},
		};
		const target = this.target;

		const updatePosition = () => {
			const computed = getComputedStyle(document.body);
			const remToPx = (rem: string) =>
				parseFloat(rem) * parseFloat(computed.fontSize);
			const spacing = remToPx(computed.getPropertyValue("--spacing-inc"));
			const selectionDirection = document.getSelection()?.direction;

			computePosition(reference, target, {
				placement: selectionDirection === "backward" ? "top" : "bottom",
				middleware: [
					offset(spacing * 2), // from `placement`
					flip(), // to opposite of `placement` if cannot fit
					shift({
						// if would overflow container shift to inside
						crossAxis: true,
						padding: {
							left: parseFloat(computed.paddingLeft),
							right: parseFloat(computed.paddingRight),
							// needs to be taller than header because appears under header
							// this is difficult to fix because of stacking contexts
							// TODO: make stack above header and change to same as bottom
							top: spacing * 14,
							bottom: spacing * 2,
						},
					}),
					inline({ padding: 0 }),
				], // position at start/end of multilines
			}).then(({ x, y }) => {
				target.style.left = `${x}px`;
				target.style.top = `${y}px`;
			});
		};
		this.cleanup();
		this.cleanup = autoUpdate(reference, target, updatePosition);
		this.open();
	}

	open() {
		this.selectedState = this.view.state;
		this.target.style.display = "";
	}

	close() {
		this.target.style.display = "none";
		this.cleanup();
	}

	destroy() {
		this.close();
		document.removeEventListener("mousedown", this.mousedown);
		document.removeEventListener("mouseup", this.mouseup);
		document.removeEventListener("selectionchange", this.selectionchange);
	}
}

export const key = new PluginKey("selectionTooltip");
export default (tooltipRef: HTMLElement) =>
	new Plugin({
		key,
		// state: {
		// 	init() {
		// 		return {};
		// 	},
		// },
		view: (v) => new SelectionTooltipPlugin(v, tooltipRef),
	});
