<script lang="ts">
import Menu from "virtual:icons/lucide/menu";
import Dropdown from "./Dropdown.svelte";
import QuickSettings from "./QuickSettings.svelte";
import { t } from "../l10n.svelte.ts";
import { p } from "../routes.ts";
import Logo from "../../img/logo.svg?raw";

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
	<search>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			autocomplete="off"
			aria-label={t("Search")}
			placeholder={t("Search")}
			id="search"
		/>
	</search>
	{#snippet icon()}
		<Menu />
	{/snippet}
	<Dropdown label={t("Main menu")} {icon}>
		<QuickSettings />
	</Dropdown>
</header>

<style>
header {
	display: grid;
	grid-template-columns: var(--grid-template-columns);
	grid-template-areas: var(--grid-template-areas);
	/* dont affect selection in body */
	user-select: none;
	/* create stacking context above main */
	z-index: 10;
	height: var(--header-height);
	width: 100%;

	position: sticky;
	top: 0;
	background: var(--color-bg-50);
	padding: --spacing(4) 0;
	border-radius: 0;

	& > .logo {
		grid-area: l;
		justify-self: start;
		height: 100%;

		& > :global(svg) {
			height: 100%;
			width: auto;
		}
	}

	& > search {
		display: flex;
		align-items: center;
		grid-area: m;

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

	& > :global(.dropdown) {
		height: 100%;
		justify-self: end;
		grid-area: r;

		& > :global(button) {
			height: 100%;
		}
	}
}
</style>
