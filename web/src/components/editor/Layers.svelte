<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte";
import Plus from "virtual:icons/lucide/plus";
import Trash from "virtual:icons/lucide/trash";

const notesId = $props.id();
</script>

<form class="table-form">
	<label>
		<span>{t("Outline")}</span>
		<select bind:value={settings.showOutline}>
			<option value="true">Publisher</option>
			<option value="false">{t("None")}</option>
		</select>
	</label>

	<label for={notesId}>
		{t("Notes")}
		<button type="button"><Plus /></button>
	</label>
	<ul id={notesId}>
		{#each ["Publisher"] as r}
			<li>
				<label>
					<span>{r}</span>
					<input
						type="checkbox"
						checked={settings.showFootnotes === "true"}
						onchange={(ev) =>
							(settings.showFootnotes = ev.currentTarget.checked
								? "true"
								: "false")}
					/>
				</label>
			</li>
		{/each}
	</ul>
</form>

<style>
form {
	padding-top: --spacing(2);
	& > *[for]:hover {
		background: none;
	}
}
ul, ul > li {
	width: 100%;
}
li > label {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

form > *:not([for]):hover button {
	background: var(--color-bg-200);
}
</style>
