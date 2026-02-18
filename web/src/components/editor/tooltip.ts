import { EditorState, Plugin } from "prosemirror-state";
import { DecorationSet, EditorView } from "prosemirror-view";
import {
	computePosition,
	autoUpdate,
	flip,
	offset,
	shift,
	inline,
} from "@floating-ui/dom";
import { key } from "./annotations";

function remToPx(rem: string) {
	return (
		parseFloat(rem) *
		parseFloat(getComputedStyle(document.documentElement).fontSize)
	);
}

class SelectionTooltip {
	tooltip: HTMLDivElement;
	cleanup = () => {};
	maybeSelecting = false;
	offset: number;

	constructor(view: EditorView) {
		this.tooltip = document.createElement("div");
		this.tooltip.className = "tooltip";
		this.tooltip.style.display = "none";

		const colors = ["red", "green"];
		for (const c of colors) {
			const b = document.createElement("button");
			b.innerText = c;
			b.addEventListener("click", () => {
				view.dispatch(view.state.tr.setMeta("annotate", c));
				// Sometimes prosemirror:
				// 1. Keeps current DOM selection
				// 2. Clears current DOM selection
				// 3. Snaps current DOM selection to non-text elements
				// ...so let's just clear it.
				document.getSelection()?.removeAllRanges();
			});
			this.tooltip.append(b);
		}
		const testButton = document.createElement("button");
		testButton.innerText = "debug";
		testButton.addEventListener("click", () => {
			const decoSet: DecorationSet = key.getState(view.state); 
			const { from, to } = view.state.selection;
			const decos = decoSet.find(from, to);
			console.log(decos);
		});
		this.tooltip.append(testButton);
		view.dom.parentNode!.appendChild(this.tooltip);

		view.dom.addEventListener("mousedown", () => {
			this.maybeSelecting = true;
			this.update(view);
		});
		view.dom.addEventListener("mouseup", () => {
			this.maybeSelecting = false;
			this.update(view);
		});

		const rem = getComputedStyle(view.dom).getPropertyValue("--spacing-inc");
		this.offset = remToPx(rem) * 4;
		this.update(view);
	}

	update(view: EditorView, lastState?: EditorState) {
		const state = view.state;
		if (
			(lastState &&
				lastState.doc.eq(state.doc) &&
				lastState.selection.eq(state.selection)) ||
			this.maybeSelecting ||
			state.selection.empty
		) {
			this.tooltip.style.display = "none";
			this.cleanup();
			return;
		}

		this.tooltip.style.display = "";
		const { from, to } = state.selection;
		const reference = {
			getBoundingClientRect: () => {
				const start = view.coordsAtPos(from);
				const end = view.coordsAtPos(to);
				const rect = new DOMRect(
					start.left,
					start.top,
					end.right - start.left,
					end.bottom - start.top,
				);
				return rect;
			},
			getClientRects: () => {
				const start = view.coordsAtPos(from);
				const end = view.coordsAtPos(to);
				return [
					new DOMRect(start.left, start.top, 0, start.bottom - start.top),
					new DOMRect(end.left, end.top, 0, end.bottom - end.top),
				];
			},
		};
		const target = this.tooltip;

		const updatePosition = () =>
			computePosition(reference, target, {
				placement: "bottom",
				middleware: [offset(this.offset), flip(), shift(), inline()],
			}).then(({ x, y }) => {
				this.tooltip.style.display = "";
				this.tooltip.style.left = `${x}px`;
				this.tooltip.style.top = `${y}px`;
			});

		this.cleanup();
		this.cleanup = autoUpdate(reference, target, updatePosition);
	}

	destroy() {
		this.cleanup();
		this.tooltip.remove();
	}
}

export default new Plugin({
	view: (v) => new SelectionTooltip(v),
});
