<script lang="ts">
import Menu from 'virtual:icons/lucide/menu';
import QuickSettings from './QuickSettings.svelte';
</script>
<header>
	<!-- onPointerMove={() => clearTimeout(closeTimeout)} -->
	<div class="logo"></div>
	<form class="search">
		<!-- svelte-ignore a11y_autofocus -->
		<input
			autofocus
			autocomplete="off"
			aria-label={t("search")}
			placeholder={t("search")}
			id="search"
		>
	</form>
	<nb-dropdown class="options">
		<button aria-label={t("menu")}>
			<Menu />
		</button>
		<div>
			<QuickSettings />
		</div>
	</nb-dropdown>
</header>
<style>
header {
	display: flex;
	gap: --spacing(4);
	margin: --spacing(2);
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
	position: sticky;
	transition: top;
	top: 0;
	background: var(--color-bg-50);
	background: color-mix(in srgb, var(--color-bg-50), transparent 5%);

	& > .logo {
		height: 2rem;
		aspect-ratio: 1;
		background-image: url(../../img/logo.svg), url(../../img/logo-32.png);
		background-size: cover;
	}

	& > .search {
		flex: 1;
		display: flex;
		align-items: center;

		& > input {
			background: var(--color-bg-100);
			border-radius: var(--radius-md);
			width: 100%;
			padding: --spacing(2);
		}
	}
}
</style>
<l10n lang="en-US">
search = Search
menu = Settings menu
</l10n>
<l10n lang="es">
search = Busca
menu = Menú de configuración
</l10n>
