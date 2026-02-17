<script lang="ts">
import { onMount } from "svelte";
import {
	computePosition,
	autoUpdate,
	flip,
	offset,
	shift,
	inline,
} from "@floating-ui/dom";
import type { EditorView } from "prosemirror-view";
import type { EditorState } from "prosemirror-state";

const { view }: { view: EditorView | undefined } = $props();

let tooltip: HTMLDivElement;
let left = $state(0);
let top = $state(0);
let display = $state("none");
let cleanup = () => {};
let maybeSelecting = $state(false);

function annotateRange(color) {
	console.log("annotate", color, view);
}

export function update(view: EditorView, lastState?: EditorState) {
	// For the inline floating-ui plugin to work and give nice positioning we
	// need `getClientRects` to return a list of selected rects. From a
	// preliminary look, prosemirror only gives the start and end positions and
	// does not account for line breaks.
	//
	// Prosemirror-view seems to keep the DOM selection and prosemirror
	// selection in sync. For this reason it seems safe to use
	// `document.getSelection`.
	const selection = document.getSelection();
	if (!selection?.rangeCount || maybeSelecting || view.state.selection.empty) {
		display = "none";
		cleanup();
		return;
	}
	const range = selection!.getRangeAt(0);

	// This is the way to get a rough position that doesn't work with `inline`.
	// const { from, to } = state.selection;
	// const start = view.coordsAtPos(from);
	// const end = view.coordsAtPos(to);
	// const rect = new DOMRect(start.left, start.top, end.right - start.left, end.bottom - start.top);
	// const reference = {
	// 	getBoundingClientRect: () => rect,
	// 	getClientRects: () => [rect], // BAD!!!!
	// };
	const reference = range;
	const target = tooltip;

	const updatePosition = () =>
		computePosition(reference, target, {
			placement: "bottom",
			middleware: [offset(4), flip(), shift(), inline()],
		}).then(({ x, y }) => {
			display = "";
			left = x;
			top = y;
		});

	cleanup();
	cleanup = autoUpdate(reference, target, updatePosition);
}

onMount(() => cleanup());
</script>
<svelte:document
	onpointerdown={() => {
		maybeSelecting = true;
	}}
	onpointerup={() => {
		maybeSelecting = false;
		update(view);
	}}
/>
<div
	class="tooltip"
	bind:this={tooltip}
	style:top={`${top}px`}
	style:left={`${left}px`}
	style:display={display}
>
 	<button onclick={() => annotateRange("red")}>red</button>
 	<button onclick={() => annotateRange("green")}>green</button>
</div>
<style>
.tooltip {
	white-space: pre-wrap;
	overflow: auto;
	position: absolute;
	top: 0;
	left: 0;
	background: var(--color-bg-300);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);
	z-index: 10;

	user-select: none;
	display: flex;
	gap: --spacing(1);
	padding: --spacing(2);
}
</style>
