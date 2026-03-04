import {
	computePosition,
	autoUpdate,
	offset,
	inline,
	shift,
	type ReferenceElement,
	type Placement,
} from "@floating-ui/dom";
import { EditorView } from "prosemirror-view";
import {
	EditorState,
	NodeSelection,
	Plugin,
	PluginKey,
	TextSelection,
	Selection as PmSelection,
} from "prosemirror-state";
import type { PluginView } from "prosemirror-state";
import "./bubbleMenu.css";

export function selToRef(
	view: EditorView,
	selection: PmSelection = view.state.selection,
): ReferenceElement {
	const { from, to } = selection;

	return {
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
		// Support floating-ui's `inline`
		getClientRects: () => {
			const start = view.coordsAtPos(from);
			const end = view.coordsAtPos(to);
			return [
				new DOMRect(start.left, start.top, 1, start.bottom - start.top),
				new DOMRect(end.left, end.top, 1, end.bottom - end.top),
			];
		},
	};
}

export function updatePositionFactory(
	reference: ReferenceElement,
	target: HTMLElement,
	placement?: Placement,
	isInline?: boolean,
) {
	return () => {
		const computed = getComputedStyle(document.body);
		const remToPx = (rem: string) =>
			parseFloat(rem) * parseFloat(computed.fontSize);
		const spacing = remToPx(computed.getPropertyValue("--spacing-inc"));
		const selectionDirection = document.getSelection()?.direction;
		// Stay out of way of selection
		placement ??= selectionDirection === "forward" ? "top" : "bottom";

		const middleware = [
			offset(spacing * 2), // from `placement`
			// flip(), // to opposite of `placement` if cannot fit
			shift({
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
		];
		if (isInline) {
			// position at start/end of multilines
			middleware.push(inline({ padding: 0 }));
		}

		computePosition(reference, target, { placement, middleware }).then(
			({ x, y }) => {
				target.style.left = `${x}px`;
				target.style.top = `${y}px`;
			},
		);
	};
}

class SelectionTooltipPlugin implements PluginView {
	view: EditorView;
	/** The tooltip */
	target: HTMLElement;
	/** Stop updating tooltip position */
	cleanup = () => {};

	contextMenu: (ev: PointerEvent) => void;
	selectionchange: () => void;
	selectedState?: EditorState;

	constructor(view: EditorView, target: HTMLElement) {
		this.view = view;
		this.target = target;

		document.addEventListener(
			"selectionchange",
			(this.selectionchange = () => {
				// Workaround clicking inside selection causes DOM to deselect, but not
				// prosemirror when editable is false on Chrome
				// https://github.com/ProseMirror/prosemirror/issues/1563
				const s = document.getSelection();
				if (
					this.view.state.selection instanceof TextSelection &&
					!this.view.dom.contains(s?.anchorNode ?? null)
				) {
					const { doc } = this.view.state;
					const atStart = TextSelection.between(doc.resolve(0), doc.resolve(0));
					const tr = this.view.state.tr.setSelection(atStart);
					this.view.dispatch(tr);
				}
			}),
		);
		// Replace android's context menu with our own.
		document.addEventListener(
			"contextmenu",
			(this.contextMenu = (ev) => {
				if (this.view.dom.contains(ev.target as any)) ev.preventDefault();
			}),
		);

		this.close();
	}

	update(view = this.view) {
		this.view = view;
		const { state } = view;

		if (
			(this.selectedState?.doc.eq(state.doc) &&
				this.selectedState.selection.eq(state.selection)) ||
			state.selection.empty ||
			(state.selection instanceof NodeSelection &&
				state.selection.node.type.name === "footnote")
		) {
			this.close();
			return;
		}

		// TODO: use prosemirror selection and figure out how to handle
		// view.coordsAtPos returning `0 0 0 0` when start/end is on display:none
		// node
		const sel = document.getSelection();
		const reference: ReferenceElement | undefined = sel?.rangeCount
			? sel?.getRangeAt(0)
			: selToRef(this.view, state.selection);

		const update = updatePositionFactory(
			reference,
			this.target,
			undefined,
			true,
		);
		this.cleanup();
		this.cleanup = autoUpdate(reference, this.target, update);

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
		document.removeEventListener("selectionchange", this.selectionchange);
		document.removeEventListener("contextmenu", this.contextMenu);
	}
}

export const key = new PluginKey("selectionTooltip");
export default (tooltipRef: HTMLElement) =>
	new Plugin({
		key,
		view: (v) => new SelectionTooltipPlugin(v, tooltipRef),
	});
