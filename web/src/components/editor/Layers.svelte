<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte";
import Plus from "virtual:icons/lucide/plus";
// import Trash from "virtual:icons/lucide/trash";

const notesId = $props.id();
</script>

<form class="table">
	<label for={notesId}>
		<h2>{t("Notes")}</h2>
		<!-- <button type="button">+</button> -->
	</label>
	<ul id={notesId}>
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
	& > *[for]:hover {
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
