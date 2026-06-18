<script lang="ts">
// https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
import type { Snippet } from "svelte";
import { computePosition, shift, flip, type Placement } from "@floating-ui/dom";

let {
	label,
	icon,
	expanded = $bindable(false),
	children,
	placement = "bottom-start",
}: {
	label: string;
	icon: Snippet;
	expanded?: boolean;
	children: Snippet;
	placement?: Placement
} = $props();

const id = $props.id();
let div: HTMLDivElement;
let pos = $state({ left: 0, top: 0 });

$effect(() => {
	if (!expanded) return;

	const computed = getComputedStyle(document.body);
	const remToPx = (rem: string) =>
		parseFloat(rem) * parseFloat(computed.fontSize);
	const spacing = remToPx(computed.getPropertyValue("--spacing-inc"));

	const reference = div.firstElementChild as HTMLButtonElement;
	const floating = div.lastElementChild as HTMLDivElement;

	computePosition(reference, floating, {
		placement,
		middleware: [
			flip(),
			shift({
				padding: spacing * 4,
				mainAxis: true,
				crossAxis: true,
			}),
		],
	}).then(({ x, y }) => {
		pos = { left: x, top: y };
	});
});
</script>

<svelte:document
	onclick={(ev) => {
		if (!div.contains(ev.target as HTMLElement)) expanded = false;
	}}
	onkeydown={(ev) => {
		if (ev.key == "Escape" && expanded) {
			expanded = false;
			ev.stopImmediatePropagation();
		}
	}}
/>

<div
	class="dropdown"
	bind:this={div}
	onblurcapture={(ev) => {
		if (
			!ev.relatedTarget ||
			!(ev.relatedTarget instanceof Element) ||
			div.contains(ev.relatedTarget)
		)
			return;

		expanded = false;
	}}
>
	<button
		aria-label={label}
		aria-expanded={expanded}
		aria-controls={id}
		onclick={() => {
			expanded = !expanded;
		}}
	>
		{@render icon()}
	</button>
	<div
		class="scrollable tooltip"
		{id}
		style:top={pos.top + "px"}
		style:left={pos.left + "px"}
	>
		{@render children()}
	</div>
</div>

<style>
.dropdown > button[aria-expanded="false"] ~ .tooltip {
	display: none;
}
</style>
