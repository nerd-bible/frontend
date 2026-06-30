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

<div class="select">
	<select bind:value {...props}>
		{@render children?.()}
	</select>
	<span>
		<Down />
	</span>
</div>

<style>
div {
	display: inline-grid;
	grid-template-areas: "overlay";
	grid-template-columns: 1fr;
	gap: --spacing(2);

	& > * {
		grid-area: overlay;
	}
}
span {
	justify-self: end;
	align-self: center;
	margin-inline-end: --spacing(1);
	pointer-events: none;
}
select {
	appearance: none;
	min-width: 12ch;
	padding: --spacing(2);
	cursor: pointer;
}
</style>
