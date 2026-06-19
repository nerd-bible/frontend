<script lang="ts">
import { settings, themes } from "../settings.svelte";
import { t } from "../l10n.svelte.ts";
import { p } from "../routes.ts";
import Select from "./Select.svelte";

let { tmpFontSize = $bindable(settings.fontSize) } = $props();
</script>

<form class="table" style={`--font-size:${tmpFontSize}px`}>
	<!-- <label> -->
	<!-- 	<span>{t("Language")}</span> -->
	<!-- 	<Select name="locale" bind:value={settings.locale}> -->
	<!-- 		{#each locales as k} -->
	<!-- 			<option value={k}> -->
	<!-- 				{new Intl.DisplayNames([k], { type: "language" }).of(k)} -->
	<!-- 			</option> -->
	<!-- 		{/each} -->
	<!-- 	</Select> -->
	<!-- </label> -->
	<label>
		<span>{t("Theme")}</span>
		<Select name="theme" bind:value={settings.theme}>
			{#each themes as theme}
				<option value={theme}>{t(theme)}</option>
			{/each}
		</Select>
	</label>
	<label>
		<span>{t("Font size")}</span>
		<div class="io">
			<output>{settings.fontSize}</output>
			<input
				type="range"
				min="8"
				max="48"
				step="2"
				bind:value={settings.fontSize}
				onchange={ev => (tmpFontSize = +ev.currentTarget.value)}
			/>
		</div>
	</label>
	<label>
		<span>{t("Line height")}</span>
		<div class="io">
			<output>{settings.lineHeight}</output>
			<input
				type="range"
				min="1"
				max="2"
				step="0.1"
				bind:value={settings.lineHeight}
			/>
		</div>
	</label>
	<a href={p("/catalog")}>
		<span>{t("Catalog")}</span>
	</a>
	<a href={p("/settings")}>
		<span>{t("Settings")}</span>
		<span>v{APP_VERSION}</span>
	</a>
</form>

<style>
form {
	font-size: var(--font-size);
	padding: --spacing(2) 0;
	width: --spacing(84);
}
:global(#popover) {
	position: absolute;
	display: none;
	background: var(--color-bg-200);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);
}
</style>
