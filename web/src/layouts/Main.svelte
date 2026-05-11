<script lang="ts">
import Header from "../components/Header.svelte";
import type { Snippet } from "svelte";
import { route } from "../routes.ts";

let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>nerd Bible - {(route.meta as any)?.title ?? route.params.id}</title>
</svelte:head>
<Header />
{@render children()}
