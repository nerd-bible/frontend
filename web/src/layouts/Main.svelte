<script lang="ts">
import Header from "../components/Header.svelte";
import type { Snippet } from "svelte";
import { route } from "../routes.ts";

let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>{(route.meta as any)?.title ?? route.params.id} | nerd Bible </title>
</svelte:head>
<div>
	<Header />
	{@render children()}
</div>

<style>
	div {
		width: calc(150ch + --spacing(16));
		display: grid;
		& > :global(*:not(.tooltip)) {
			display: grid;
			grid-template-columns: subgrid;
			grid-column: 1 / span all;
		}
		justify-content: center;
		grid-template-columns: 1fr --spacing(8) auto --spacing(8) 1fr;
	}
</style>
