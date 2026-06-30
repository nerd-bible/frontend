<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte";
import Select from "../Select.svelte";
// import Plus from "virtual:icons/lucide/plus";
// import Trash from "virtual:icons/lucide/trash";
</script>

<form class="table">
	<h2>{t("Outline")}</h2>
	<!-- <button type="button">+</button> -->
	<Select bind:value={settings.showOutline} name="outline">
		<option value={true}>Publisher</option>
		<option value={false}>{t("None")}</option>
	</Select>

	<h2>{t("Notes")}</h2>
	<!-- <button type="button">+</button> -->

	<ul>
		{#each ["Publisher"] as r}
			<li>
				<label>
					<span>{r}</span>
					<input type="checkbox" bind:checked={settings.showFootnotes} />
				</label>
			</li>
		{/each}
	</ul>
</form>

<style>
form {
	h2:hover, :global(.select:hover) {
		background: none;
	}
	h2 {
		font-size: 1.8em;
	}
}
ul,
ul > li {
	width: 100%;
}
li > label {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* button { */
/* 	line-height: 1; */
/* } */
/* form > *:not([for]):hover button { */
/* 	background: var(--color-bg-200); */
/* } */
</style>
