<script lang="ts">
import { Router, type RouteConfig, route } from "@mateothegreat/svelte5-router";
import SQL from "../components/sql.svelte";
const routes = [
	{ component: SQL },
	{ component: SQL, path: "sql" }
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
<style>
.settings {
	flex-grow: 1;
	display: flex;
	gap: --spacing(4);
	padding: --spacing(4);

	> main {
		flex-grow: 1;
	}

	> nav {
		padding: 0 --spacing(4);
		background: var(--color-bg-100);
		ul > li {
			padding: --spacing(4);
		}
	}
}
</style>
<l10n lang="en-US">
sql = SQL
</l10n>
<l10n lang="es">
sql = SQL
</l10n>
