<script lang="ts">
import { settings, themes } from "../settings.svelte";
import { t } from "../l10n.svelte.ts";
import { p, route } from "../routes.ts";
</script>

<form class="table-form">
	<!-- <label> -->
	<!-- 	<span>{t("Language")}</span> -->
	<!-- 	<select name="locale" bind:value={settings.locale}> -->
	<!-- 		{#each locales as k} -->
	<!-- 			<option value={k}> -->
	<!-- 				{new Intl.DisplayNames([k], { type: "language" }).of(k)} -->
	<!-- 			</option> -->
	<!-- 		{/each} -->
	<!-- 	</select> -->
	<!-- </label> -->
	<label>
		<span>{t("Theme")}</span>
		<select name="theme" bind:value={settings.theme}>
			{#each themes as theme}
				<option value={theme}>{t(theme)}</option>
			{/each}
		</select>
	</label>

	{#if route.pathname.match(/^\/[^/]+$/)}
		<label>
			<span>{t("Font size")}</span>
			<div>
				{settings.fontSize}
				<input
					type="range"
					min="8"
					max="48"
					step="2"
					bind:value={settings.fontSize}
				/>
			</div>
		</label>
		<label>
			<span>{t("Line height")}</span>
			<div>
				{settings.lineHeight}
				<input
					type="range"
					min="1"
					max="2"
					step="0.1"
					bind:value={settings.lineHeight}
				/>
			</div>
		</label>
	{/if}
	<a href={p("/settings")}>
		<span>{t("Settings")}</span>
		<span>v{APP_VERSION}</span>
	</a>
</form>

<style>
form {
	padding: --spacing(2) 0;
	width: --spacing(84);

	select {
		background: var(--color-bg-300);
	}
}
:global(#popover) {
	position: absolute;
	display: none;
	background: var(--color-bg-200);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);
}
:global(nb-dropdown:not(:defined) > div) {
	display: none;
}
</style>
