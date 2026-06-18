<script lang="ts">
import Menu from "virtual:icons/lucide/menu";
import Dropdown from "./Dropdown.svelte";
import QuickSettings from "./QuickSettings.svelte";
import { t } from "../l10n.svelte.ts";
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
	class="fadedown"
	bind:this={headerRef}
	onpointerenter={() => (pointerOver = true)}
	onpointerleave={() => (pointerOver = false)}
>
	<div class="l">
		<div id="headerLeft"></div>
		{@html Logo}
	</div>
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
	<Dropdown label={t("Main menu")} placement="bottom-end" {icon}>
		<QuickSettings />
	</Dropdown>
</header>

<style>
header {
	display: grid;
	grid-template-columns: var(--grid-template-columns);
	grid-template-areas: var(--grid-template-areas);
	background: var(--color-bg-50);
	/* dont affect selection in body */
	user-select: none;
	/* create stacking context above main */
	z-index: 10;
	width: 100%;

	position: sticky;
	top: 0;
	padding: --spacing(4) 0;
	border-radius: 0;

	& > .l {
		grid-area: l;
		justify-self: start;
		display: flex;
		align-items: center;
		gap: --spacing(2);

		:global(svg) {
			height: 90%;
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
