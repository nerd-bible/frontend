<script lang="ts">
import { Router, type RouteConfig, route } from "@mateothegreat/svelte5-router";
import Sql from "./Sql.svelte";
import Storage from "./Storage.svelte";
import { t } from "../../l10n.svelte.ts";

const routes = [
	{ component: Sql, title: "SQL" },
	{ component: Storage, title: "Storage" },
].map((r) => ({ ...r, path: r.title.toLowerCase() })) satisfies RouteConfig[];
</script>

<div class="settings">
	<nav>
		<ul>
			{#each routes as r}
				{#if r.path}
					<li><a href={`/settings/${r.path}`} use:route>{t(r.title)}</a></li>
				{/if}
			{/each}
		</ul>
	</nav>
	<main>
		<Router basePath="/settings" {routes} />
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
