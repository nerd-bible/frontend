<script lang="ts">
// https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
import type { Snippet } from "svelte";
import {
	computePosition,
	shift,
	flip,
	autoUpdate,
	type Placement,
} from "@floating-ui/dom";
import { spacing } from "../helpers.ts";

let {
	label,
	icon,
	expanded = $bindable(false),
	relayout = $bindable(1),
	children,
	placement = "bottom-start",
	autoUpdate: doAutoUpdate = false,
}: {
	label: string;
	icon: Snippet;
	expanded?: boolean;
	relayout?: number;
	children: Snippet;
	placement?: Placement;
	autoUpdate?: boolean;
} = $props();

const id = $props.id();
let div: HTMLDivElement;
let pos = $state({ left: 0, top: 0 });

$effect(() => {
	if (!expanded) return;
	relayout;

	const reference = div.firstElementChild as HTMLButtonElement;
	const floating = div.lastElementChild as HTMLDivElement;

	function updatePosition() {
		computePosition(reference, floating, {
			placement,
			middleware: [
				flip(),
				shift({
					padding: spacing(4),
					mainAxis: true,
					crossAxis: true,
				}),
			],
		}).then(({ x, y }) => {
			pos = { left: x, top: y };
		});
	}

	if (doAutoUpdate) return autoUpdate(reference, floating, updatePosition);
	else updatePosition();
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
		role="tooltip"
		{id}
		style:top={pos.top + "px"}
		style:left={pos.left + "px"}
	>
		{@render children()}
	</div>
</div>

<style>
.dropdown > button[aria-expanded="false"] ~ [role="tooltip"] {
	display: none;
}
</style>
