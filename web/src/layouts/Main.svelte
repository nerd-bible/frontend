<script lang="ts">
import Header from "../components/Header.svelte";
import type { Snippet } from "svelte";
import { route } from "../routes.ts";

let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<title>{(route.meta as any)?.title ?? route.params.id} | nerd Bible </title>
</svelte:head>
<Header />
{@render children()}
