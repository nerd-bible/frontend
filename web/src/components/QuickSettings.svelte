<script lang="ts">
import { route } from "@mateothegreat/svelte5-router";
import { settings, locales, textBlockings, chapterNumDisplays } from "../settings.svelte";
</script>
<form class="popover">
	<label>
		<span>{t("theme")}</span>
		<select id="theme" bind:value={settings.theme}>
			<option value="system">{t("system")}</option>
			<option value="dark">{t("dark")}</option>
			<option value="light">{t("light")}</option>
		</select>
	</label>
	<label>
		<span>{t("fontSize")}</span>
		<input id="fontSize" type="range" min="8" max="48" step="2" bind:value={settings.fontSize}>
	</label>
	<label>
		<span>{t("columnWidth")}</span>
		<input id="columnWidth" type="range" min="100" max="2000" step="20" bind:value={settings.columnWidth}>
	</label>
	<label>
		<span>{t("textBlocking")}</span>
		<select id="textBlocking" bind:value={settings.textBlocking}>
			{#each textBlockings as textBlocking}
				<option value={textBlocking}>{t(textBlocking)}</option>
			{/each}
		</select>
	</label>
	<label>
		<span>{t("chapterDisplay")}</span>
		<select id="chapterDisplay" bind:value={settings.chapterNumDisplay}>
			{#each chapterNumDisplays as numDisplay}
				<option value={numDisplay}>{t(numDisplay)}</option>
			{/each}
		</select>
	</label>
	<label>
		<span>{t("showVerse")}</span>
		<input
			type="checkbox"
			id="showVerse"
			value={settings.showVerseNum === "true"}
			onchange={(ev) => settings.showVerseNum = ev.currentTarget.checked ? "true" : "false"}
		>
	</label>
	<label>
		<span>{t("language")}</span>
		<select id="locale" bind:value={settings.locale}>
			{#each Object.entries(locales) as [k, v]}
				<option value={k}>{v.name}</option>
			{/each}
		</select>
	</label>
	<a href="/settings" use:route>
		<span>{t("settings")}</span>
		<span>v{APP_VERSION}</span>
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

	& > a:hover {
		background: var(--color-bg-100);
	}

	select {
		width: --spacing(32);
		padding: --spacing(2);
		background: var(--color-bg-300);
	}

	input {
		padding: --spacing(2) 0;
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
<l10n lang="en-US">
theme = Theme
system = System
dark = Dark
light = Light
fontSize = Font size
columnWidth = Column width
language = Language
settings = Settings
textBlocking = Text blocking
paragraph = Paragraph
chapter = Chapter
verse = Verse
sentence = Sentence
showVerse = Show verse numbers
chapterDisplay = Chapter display
float = Float
normal = Normal
small = Small
none = None
</l10n>
<l10n lang="es">
theme = Tema
system = Sistema
dark = Oscura
light = Ligera
fontSize = Tamaño de fuente
columnWidth = Ancho de columna
language = Idioma
settings = Ajustes
textBlocking = Bloqueo de texto
paragraph = Párrafo
chapter = Capítulo
verse = Versículo
sentence = Oración
</l10n>
