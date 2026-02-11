<script lang="ts">
import Menu from 'virtual:icons/lucide/menu';
import QuickSettings from './QuickSettings.svelte';

let lastScrollY = window.scrollY;
let isHidden = $state(false);
function onScroll() {
	isHidden = window.scrollY > lastScrollY;
	lastScrollY = window.scrollY;
}
</script>
<svelte:document onscroll={onScroll} />
<header class:hidden={isHidden}>
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
		<div class="content">
			<QuickSettings />
		</div>
	</nb-dropdown>
</header>
<style>
header {
	display: flex;
	gap: --spacing(4);
	padding: --spacing(2);
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
	position: sticky;
	transition: top;
	top: 0;
	background: var(--color-bg-50);
	background: color-mix(in srgb, var(--color-bg-50), transparent 5%);
	/* appear over tooltips which have z-index 10 */
	z-index: 20;

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

	&.hidden {
		transition-property: translate;
		transition-duration: 1s;
		translate: 0 calc(-2rem - --spacing(8));
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
