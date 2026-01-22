<script lang="ts">
import { locales, settings } from "../settings.svelte";
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
		<span></span>
		<select id="theme">
			<option value="system"></option>
			<option value="dark"></option>
			<option value="light"></option>
		</select>
	</label>
	<label>
		<span></span>
		<input id="fontSize" type="range" min="8" max="48" step="2">
	</label>
	<label>
		<span></span>
		<input id="columnWidth" type="range" min="100" max="2000" step="20">
	</label>
	<label>
		<span>Locale</span>
		<select id="locale" bind:value={settings.locale}>
			{#each Object.entries(locales) as [k, v]}
				<option value={k}>{v.name}</option>
			{/each}
		</select>
	</label>
	<a href="/settings">
		<span></span>
		<span>v{ APP_VERSION }</span>
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
Theme = Theme
System = System
Dark = Dark
Light = Light
Font-size = Font size
Column-width = Column width
Language = Language
Settings = Settings
</l10n>
<l10n lang="es">
Theme = Tema
System = Sistema
Dark = Oscura
Light = Ligera
Font-size = Tamaño de fuente
Column-width = Ancho de columna
Language = Idioma
Settings = Ajustes
</l10n>
