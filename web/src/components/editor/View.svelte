<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte.ts";
</script>

<form class="table">
	<label>
		<span>
			{t("Drop caps")}
			<span class="caption">{t("Style each chapter's first letter")}</span>
		</span>
		<input type="checkbox" bind:checked={settings.showDropCaps} />
	</label>
	<label>
		<span>{t("Chapter numbers")}</span>
		<input type="checkbox" bind:checked={settings.showChapterNum} />
	</label>
	<label>
		<span>{t("Verse numbers")}</span>
		<input type="checkbox" bind:checked={settings.showVerseNum} />
	</label>
	<label>
		<span>{t("Justify text")}</span>
		<input type="checkbox" bind:checked={settings.justifyText} />
	</label>
	<label>
		<span>{t("Lock layout")}</span>
		<input type="checkbox" bind:checked={settings.lockLayout} />
	</label>
</form>

<style>
.caption {
	display: block;
	font-size: 70%;
	color: var(--color-fg-200);
}
</style>
