<script lang="ts">
import Header from "../components/Header.svelte";
import type { Snippet } from "svelte";
import { route, titleFromRoute } from "../routes.ts";

let { children }: { children: Snippet } = $props();
let title = $derived.by(() => titleFromRoute(route.params, route.meta));
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<div>
	<Header />
	{@render children()}
</div>
<style>
div > :global(*) {
	padding-inline: var(--layout-padding-x);
}
</style>
