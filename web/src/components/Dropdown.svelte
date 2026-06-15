<script lang="ts">
// https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
import type { Snippet } from "svelte";

let {
	label,
	icon,
	expanded = $bindable(false),
	children,
}: {
	label: string;
	icon: Snippet;
	expanded?: boolean;
	children: Snippet;
} = $props();

const id = $props.id();
let div: HTMLDivElement;
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
	<div class="content scrollable" {id}>
		{@render children()}
	</div>
</div>

<style>
.dropdown {
	position: relative;
	translate: 0 0;

	& > .content {
		position: absolute;
		border-radius: var(--radius-md);
		background: var(--color-bg-200);
		top: auto;
		inset-inline-end: 0;
	}

	& > button[aria-expanded="false"] ~ .content {
		display: none;
	}
}
</style>
