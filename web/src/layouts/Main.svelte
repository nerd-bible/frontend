<script lang="ts">
import Header from "../components/Header.svelte";
import type { Snippet } from "svelte";
import { route } from "../routes.ts";

let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>{(route.meta as any)?.title ?? route.params.id} | nerd Bible</title>
</svelte:head>
<div>
	<Header />
	{@render children()}
</div>

<style>
div {
	padding: 0 --spacing(4);
	width: calc(150ch + --spacing(16));

	/* for sticky sidebars */
	--header-height: calc(1lh + --spacing(12));

	--grid-template-columns: 1fr --spacing(8) minmax(20ch, 80ch) --spacing(8) 1fr;
	--grid-template-areas: "l s1 m s2 r";
}

@media (width > 80ch) {
	:global(body) {
		justify-content: center;
	}
}

</style>
