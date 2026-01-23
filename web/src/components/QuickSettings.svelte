<script lang="ts">
import locales from "../locales";
import settings from "../settings.svelte";

	// import { locale, locales, persistentSignal } from "../l10n";
	//
	// const theme = persistentSignal("theme", "system");
	// effect(() => {
	// 	document.documentElement.className = theme();
	// });
	//
	// const fontSize = persistentSignal("fontSize", "20");
	// effect(() => {
	// 	document.querySelector("main").style.fontSize = `${fontSize()}px`
	// });
	//
	// const columnWidth = persistentSignal("columnWidth", "600");
	// effect(() => {
	// 	document.querySelector("main").style.maxWidth = `${columnWidth()}px`
	// });
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
		<span>{t("language")}</span>
		<select id="locale" bind:value={settings.locale}>
			{#each Object.entries(locales) as [k, v]}
				<option value={k}>{v.name}</option>
			{/each}
		</select>
	</label>
	<a href="/settings">
		<span>{t("settings")}</span>
		<span>v{APP_VERSION}</span>
	</a>
</form>
<style>
form {
	padding: --spacing(2) 0;
	user-select: none;
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
</l10n>
