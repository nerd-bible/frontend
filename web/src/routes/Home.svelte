<script lang="ts">
import { t } from "../l10n.svelte";
import { settings } from "../settings.svelte";
</script>
<div class="home">
	<section>
		<h2>{t("Scripture")}</h2>
		<ul>
			<li>
				<a href="/bsb/gen">BSB - Genesis (2 notes)</a>
			</li>
		</ul>
	</section>

	<section>
		<h2>{t("History")}</h2>
		<ul>
			{#each settings.history as { path, title }}
				<li><a href={path}>{title}</a></li>
			{/each}
		</ul>
	</section>
</div>
<style>
.home {
	padding: --spacing(4);
	display: flex;
	flex-wrap: wrap;
	gap: --spacing(4);

	& > section {
		min-width: 80ch;
		max-width: 100ch;
		min-width: calc((100vw - --spacing(12)) / 2);
		max-height: calc((100vh - var(--header-height) - --spacing(4)) / 2);
		overflow: auto;
	}
}
</style>
