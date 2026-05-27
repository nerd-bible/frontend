<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte";
import Plus from "virtual:icons/lucide/plus";
import Trash from "virtual:icons/lucide/trash";
import Eye from "virtual:icons/lucide/eye";
import EyeClosed from "virtual:icons/lucide/eye-closed";

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
				{r}
				<button
					type="button"
					onclick={() => {
						settings.showFootnotes = settings.showFootnotes === "true" ? "false" : "true";
					}}
				>
					{#if settings.showFootnotes}
						<Eye />
					{:else}
						<EyeClosed />
					{/if}
				</button>
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
li {
	display: flex;
	align-items: center;
	width: 100%;
	justify-content: space-between;
}

form > *:not([for]):hover button {
	background: var(--color-bg-200);
}
</style>
