<script lang="ts">
import { t } from "../l10n.svelte";
</script>

<div class="catalog">
	<section>
		<h2>{t("Scripture")}</h2>
		<ul>
			<li>
				<a href="/bsb/gen">BSB - Genesis (2 notes)</a>
			</li>
		</ul>
	</section>
</div>
<style>
.catalog {
	padding: --spacing(4);
	display: flex;
	flex-wrap: wrap;
	gap: --spacing(16);
}
</style>
