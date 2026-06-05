<script lang="ts">
import type { HTMLSelectAttributes } from "svelte/elements";
import Down from "virtual:icons/lucide/chevron-down";
// This component is unfortunately necessary because the dropdown arrow cannot
// be recolored based on the theme with only a native <select>.
let {
	children,
	value = $bindable(),
	...props
}: HTMLSelectAttributes = $props();
</script>

<div>
	<select {value} {...props}>
		{@render children()}
	</select>
	<Down />
</div>

<style>
div {
	position: relative;
	display: inline-block;
	background: var(--select-bg);
	& > :global(svg) {
		position: absolute;
		pointer-events: none;
		top: 0.5lh;
		right: --spacing(2);
	}
}
select {
	appearance: none;
	background: none;
	min-width: 10ch;
	width: 100%;
	padding: --spacing(2);
	cursor: pointer;

	:global(option) {
		color: inherit;
		background-color: var(--select-bg);
	}
}
</style>
