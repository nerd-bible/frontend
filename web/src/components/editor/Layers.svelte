<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte";

let noteSources = $state(["publisher"]);

$effect(() => {
	settings.showFootnotes = (noteSources[0] === "none") ? "false" : "true";
});
</script>

<form>
	<label>
		{t("Outline")}
		<select bind:value={settings.showOutline}>
			<option value="true">Publisher</option>
			<option value="false">{t("None")}</option>
		</select>
	</label>

	<label>
		{t("Footnotes")}
		<select multiple bind:value={noteSources}>
			<option value="publisher">Publisher</option>
			<option value="none">None</option>
		</select>
	</label>
</form>

<style>
	label {
		display: block;
	}
</style>
