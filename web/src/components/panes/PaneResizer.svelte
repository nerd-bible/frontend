<script lang="ts">
import type { SvelteHTMLElements } from "svelte/elements";

const props: SvelteHTMLElements["div"] = $props();

</script>
<div data-resizer {...props}></div>
<style>
div {
	flex-shrink: 0;
	width: --spacing(8);
	cursor: ew-resize;
	background: linear-gradient(
		to right,
		transparent 40%,
		var(--color-bg-100) 50%,
		transparent 60%
	);
	position: sticky;
	top: 0;
}
</style>
