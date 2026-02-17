<script lang="ts">
import { Router, type RouteConfig, route } from "@mateothegreat/svelte5-router";
import Sql from "../components/Sql.svelte";
const routes = [
	{ component: Sql },
	{ component: Sql, path: "sql" }
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
	gap: --spacing(8);
	padding: --spacing(4);

	> main {
		flex-grow: 1;
	}

	> nav {
		background: var(--color-bg-100);
		ul > li > a {
			display: block;
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
