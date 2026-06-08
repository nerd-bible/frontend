<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte.ts";
</script>

<form class="table">
	<label>
		<span>{t("Drop caps")}</span>
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
</form>
