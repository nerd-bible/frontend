<script lang="ts">
import Main from "./Main.svelte";
import type { Snippet } from "svelte";
import { routes, p } from "../routes.ts";

let { children }: { children: Snippet } = $props();

const settingsRoutes = Object.keys(routes["/settings"]).filter((r) =>
	r.startsWith("/"),
);
</script>

<div class="settings">
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
	<main>
		{@render children()}
	</main>
</div>

<style>
.settings {
	display: flex;
	gap: --spacing(8);
	padding: --spacing(4);

	> main {
		flex-grow: 1;
	}

	> nav > ul {
		background: var(--color-bg-100);
		li > a {
			display: block;
			padding: --spacing(4);
		}
	}
}
</style>
