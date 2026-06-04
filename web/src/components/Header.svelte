<script lang="ts">
import Menu from "virtual:icons/lucide/menu";
import QuickSettings from "./QuickSettings.svelte";
import { t } from "../l10n.svelte.ts";
import { p } from "../routes.ts";
import Logo from "../../img/logo.svg?raw";
import LogoWide from "../../img/logo-wide.svg?raw";

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
	<a href={p("/")} class="logo">
		{@html Logo}
	</a>
	<div></div>
	<search>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			autocomplete="off"
			aria-label={t("Search")}
			placeholder={t("Search")}
			id="search"
		/>
	</search>
	<div></div>
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
.options {
	height: 100%;
	aspect-ratio: 1;
	justify-self: end;
	& > button {
		display: flex;
	}
}
header {
	align-items: center;
	/* dont affect selection in body */
	user-select: none;
	/* create stacking context above main */
	z-index: 10;
	height: 100%;

	& > .logo {
		justify-self: start;
		height: 100%;

		& > :global(svg) {
			height: 100%;
			width: auto;
		}
	}

	& > search {
		flex: 1;
		display: flex;
		align-items: center;

		& > input {
			text-align: center;

			&:focus {
				text-align: start;
			}
			background: var(--color-bg-100);
			width: 100%;
			padding: --spacing(2);
		}
	}
}
</style>
