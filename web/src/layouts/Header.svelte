<script lang="ts">
// Our router does not allow passing multiple components to a route nor passing
// components as layout parameters. For this reason we have to split HolyGrail
// and Header.
import Header from "../components/Header.svelte";
import type { Snippet } from "svelte";
import { route, titleFromRoute } from "../routes.ts";

let { children }: { children: Snippet } = $props();
let title = $derived.by(() => titleFromRoute(route.params, route.meta));
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>
<Header />
{@render children()}

<style>
:global(body > *) {
	/* margin doesn't count toward clientWidth for ThreeCol's Resizer */
	margin-inline: var(--layout-padding-x);
	font-size: var(--font-size);
}

:global(body > *:not(.header)) {
	line-height: var(--line-height);
}
</style>
