<script lang="ts">
import type { Snippet } from "svelte";
import { routes, p } from "../routes.ts";
import HeaderLayout from "./Header.svelte";
import ThreeCol from "./ThreeCol.svelte";

let { children }: { children: Snippet } = $props();

const settingsRoutes = Object.keys(routes["/settings"]).filter((r) =>
	r.startsWith("/"),
);
</script>

<HeaderLayout>
	<ThreeCol hideRight>
		{#snippet left()}
			<nav>
				<ul>
					{#each settingsRoutes as r}
						<li>
							<a href={p(`/settings${r}`)}>
								{routes["/settings"][r].meta.title}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/snippet}
		{@render children()}
	</ThreeCol>
</HeaderLayout>
