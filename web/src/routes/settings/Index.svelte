<script lang="ts">
import { Router, type RouteConfig, route } from "@mateothegreat/svelte5-router";
import Sql from "./Sql.svelte";
import Storage from "./Storage.svelte";

const routes = [
	{ component: Sql, path: "sql" },
	{ component: Storage, path: "storage" },
] satisfies RouteConfig[];
</script>

<div class="settings">
	<nav>
		<ul>
			{#each routes as r}
				{#if r.path}
					<li><a href={`/settings/${r.path}`} use:route>{t(r.path)}</a></li>
				{/if}
			{/each}
		</ul>
	</nav>
	<main>
		<Router basePath="/settings" {routes} />
	</main>
</div>
<l10n lang="en-US"> sql = SQL storage = Storage </l10n>

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
