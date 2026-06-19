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
	<div id="headerLeft"></div>
	{@html Logo}
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
	<div>
		<Dropdown label={t("Main menu")} placement="bottom-end" {icon}>
			<QuickSettings />
		</Dropdown>
	</div>
</header>

<style>
header {
	height: var(--header-height);

	place-items: center;
	display: grid;
	grid-template-columns: min-content min-content 1fr min-content;
	background: var(--color-bg-100);
	/* dont affect selection in body */
	user-select: none;
	/* create stacking context above main */
	z-index: 10;

	position: sticky;
	top: 0;
	border-radius: 0;
	border-bottom: 1px solid var(--color-fg-800);

	& > div > :global(.dropdown > button) {
		padding: --spacing(1);
		& > :global(svg) {
			width: 1.6em;
			height: 1.6em;
		}
	}

	& > :global(svg) {
		height: 2.5em;
		padding-inline-start: --spacing(3);
	}

	& > search {
		width: 100%;
		max-width: 1000px;
		padding: 0 --spacing(4);

		& > input {
			width: 100%;
			padding: --spacing(2) --spacing(3.2);
			background: var(--color-bg-200);
			&:hover, &:focus {
				border-color: var(--color-focus-200);
			}
		}
	}
}
</style>
