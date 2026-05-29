<script lang="ts">
import Menu from "virtual:icons/lucide/menu";
import QuickSettings from "./QuickSettings.svelte";
import { t } from "../l10n.svelte.ts";
import { p } from "../routes.ts";

let headerRef: HTMLElement;
let lastScrollY = window.scrollY;
let visible = $state(true);
let pointerOver = $state(false);
function onScroll() {
	visible = Boolean(
		pointerOver ||
		window.scrollY <= lastScrollY ||
		window.scrollY <= headerRef.clientHeight / 2 ||
		headerRef.contains(document.activeElement),
	);
	lastScrollY = window.scrollY;
}
</script>

<svelte:document onscroll={onScroll} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<header
	bind:this={headerRef}
	onpointerenter={() => (pointerOver = true)}
	onpointerleave={() => (pointerOver = false)}
>
	<a href={p("/")} class="logo" title={t("Home")}></a>
	<search>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			autocomplete="off"
			aria-label={t("Search")}
			placeholder={t("Search")}
			id="search"
		/>
	</search>
	<nb-dropdown class="options">
		<button aria-label={t("Menu")}>
			<Menu />
		</button>
		<div class="content">
			<QuickSettings />
		</div>
	</nb-dropdown>
</header>

<style>
.options > button {
	display: flex;
}
header {
	display: flex;
	gap: --spacing(4);
	padding: --spacing(2) --spacing(4);
	justify-content: space-between;
	align-items: center;
	background: var(--color-bg-50);
	background: color-mix(in srgb, var(--color-bg-50), transparent 5%);
	/* dont affect selection in body */
	user-select: none;
	/* create stacking context above main */
	z-index: 10;

	& > .logo {
		height: 2rem;
		aspect-ratio: 1;
		background-image: url(../../img/logo.svg), url(../../img/logo-32.png);
		background-size: cover;
		&.connected {
			filter: drop-shadow(0 0 --spacing(2) var(--color-secondary))
				drop-shadow(0 0 --spacing(4) var(--color-secondary))
				drop-shadow(0 0 --spacing(8) var(--color-secondary));
		}
	}

	& > search {
		flex: 1;
		display: flex;
		align-items: center;

		& > input {
			background: var(--color-bg-100);
			width: 100%;
			padding: --spacing(2);
		}
	}
}
</style>
