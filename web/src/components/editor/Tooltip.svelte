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
	import { key } from "./annotations";
	import { DecorationSet, EditorView } from "prosemirror-view";
	import { settings } from "../../settings.svelte";

	let { view, counter }: { view: EditorView, counter: number } = $props();

	let ref: HTMLDivElement;
	let cleanup = () => {};
	let open = $state(false);
	let maybeSelecting = $state(false);
	onMount(() => cleanup);

	const selectionIsEmpty = (selection: Selection) =>
		selection.anchorNode === selection.focusNode &&
			selection.anchorOffset === selection.focusOffset;

	function onSelectionChange() {
		cleanup();

		// I really tried to use the prosemirror selection as the source of truth.
		// However, it doesn't update on blur AND is painful to hookup to svelte
		// and floating-ui.
		const selection = document.getSelection();
		if (!selection?.rangeCount || selectionIsEmpty(selection)) {
			open = false;
			return;
		}
		if (maybeSelecting) return;
		const range = selection.getRangeAt(0);
		void counter;
		if (!view.dom.contains(range.commonAncestorContainer)) {
			open = false;
			return;
		}

		const reference = range;
		const target = ref;

		const updatePosition = () => {
			const computed = getComputedStyle(document.body); 
			const remToPx = (rem: string) => (
				parseFloat(rem) *
				parseFloat(computed.fontSize)
			);
			const spacing = remToPx(computed.getPropertyValue("--spacing-inc"));
			computePosition(reference, target, {
				placement: "bottom",
				middleware: [
					offset(spacing * 2), // from `placement`
					flip(), // to opposite of `placement` if cannot fit
					shift({ // if would overflow container shift to inside
						crossAxis: true,
						padding: {
							left: parseFloat(computed.paddingLeft),
							right: parseFloat(computed.paddingRight),
							top: spacing * 14, // needs to be taller than header
							bottom: spacing * 2,
						},
					}),
					inline({ padding: 0 })], // position at start/end of multilines
			}).then(({ x, y }) => {
				ref.style.left = `${x}px`;
				ref.style.top = `${y}px`;
			});
		}

		cleanup = autoUpdate(reference, target, updatePosition);
		open = true;
	}
</script>
<svelte:document
	onmousedown={() => maybeSelecting = true}
	onmouseup={() => {
		maybeSelecting = false;
		onSelectionChange();
	}}
	onselectionchangecapture={onSelectionChange}
/>
<!-- svelte-ignore a11y_click_events_have_key_events it's for child buttons -->
<!-- svelte-ignore a11y_no_static_element_interactions it's for child buttons -->
<div
	class="tooltip"
	bind:this={ref}
	style:display={open ? "" : "none"}
	onclick={() => {
		// Sometimes prosemirror:
		// 1. Keeps current DOM selection
		// 2. Clears current DOM selection
		// 3. Snaps current DOM selection to non-text elements
		// ...so let's just clear it and hide ourselves.
		open = false;
		document.getSelection()?.removeAllRanges();
	}}
>
	{#each Object.keys(JSON.parse(settings.userHighlights)) as k}
		<button onclick={() => {
			void counter;
			view.dispatch(view.state.tr.setMeta("annotate", k));
		}}>
			{k}
		</button>
	{/each}
	<button onclick={() => {
		const decoSet: DecorationSet = key.getState(view.state); 
		const { from, to } = view.state.selection;
		const decos = decoSet.find(from, to);
		console.log(decos);
	}}>
		debug
	</button>
</div>
<style>
.tooltip {
	position: absolute;
	background: var(--color-bg-300);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);

	display: flex;
	gap: --spacing(1);
	padding: --spacing(2);

	/* If need to remove overflow-x hidden on body, add these + inner wrapper element: */
	/* https://stackoverflow.com/questions/9933092/css-prevent-absolute-positioned-element-from-overflowing-body */
	/* right: 0; */
	/* overflow: hidden; */
}
</style>
