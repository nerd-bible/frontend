<script lang="ts">
import { settings, chapterNumDisplays, themes } from "../settings.svelte";
import { t } from "../l10n.svelte.ts";
import { p, route } from "../routes.ts";
</script>

<form class="popover">
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
			<input
				type="range"
				min="8"
				max="48"
				step="2"
				bind:value={settings.fontSize}
			/>
		</label>
		<label>
			<span>{t("Column width")}</span>
			<input
				type="range"
				min="100"
				max="2000"
				step="20"
				bind:value={settings.columnWidth}
			/>
		</label>
		<label>
			<span>{t("Chapter style")}</span>
			<select name="chapterStyle" bind:value={settings.chapterNumDisplay}>
				{#each chapterNumDisplays as numDisplay}
					<option value={numDisplay}>{t(numDisplay)}</option>
				{/each}
			</select>
		</label>
		<label>
			<span>{t("Show verse numbers")}</span>
			<input
				type="checkbox"
				checked={settings.showVerseNum === "true"}
				onchange={(ev) =>
					(settings.showVerseNum = ev.currentTarget.checked ? "true" : "false")}
			/>
		</label>
		<label>
			<span>{t("Show footnotes")}</span>
			<input
				type="checkbox"
				checked={settings.showFootnotes === "true"}
				onchange={(ev) =>
					(settings.showFootnotes = ev.currentTarget.checked
						? "true"
						: "false")}
			/>
		</label>
	{/if}
	<a href={p("/settings")}>
		<span>{t("Settings")}</span>
		<span>{APP_VERSION}</span>
	</a>
</form>

<style>
form {
	padding: --spacing(2) 0;
	width: --spacing(84);
	line-height: 2;

	& > * {
		width: 100%;
		padding: --spacing(1) --spacing(4);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	& > label > input[type="checkbox"] {
		width: 2em;
	}

	& > *:hover {
		background: var(--color-bg-100);
	}

	select {
		width: --spacing(32);
		padding: --spacing(2);
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
