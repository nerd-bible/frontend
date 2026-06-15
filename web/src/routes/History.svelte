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
	gap: --spacing(16);
}
</style>
