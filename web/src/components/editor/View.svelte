<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte.ts";
</script>

<form class="table">
	<label>
		<span>{t("Drop caps")}</span>
		<input
			type="checkbox"
			checked={settings.showDropCaps === "true"}
			onchange={(ev) =>
				(settings.showDropCaps = ev.currentTarget.checked ? "true" : "false")}
		/>
	</label>
	<label>
		<span>{t("Chapter numbers")}</span>
		<input
			type="checkbox"
			checked={settings.showChapterNum === "true"}
			onchange={(ev) =>
				(settings.showChapterNum = ev.currentTarget.checked ? "true" : "false")}
		/>
	</label>
	<label>
		<span>{t("Verse numbers")}</span>
		<input
			type="checkbox"
			checked={settings.showVerseNum === "true"}
			onchange={(ev) =>
				(settings.showVerseNum = ev.currentTarget.checked ? "true" : "false")}
		/>
	</label>
</form>
