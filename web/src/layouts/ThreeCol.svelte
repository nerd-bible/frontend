<script lang="ts">
// Reponsive 3-column layout with features
// https://en.wikipedia.org/wiki/Holy_grail_(web_design)
import type { SvelteHTMLElements } from "svelte/elements";
import type { Attachment } from "svelte/attachments";
import Toc from "virtual:icons/lucide/table-of-contents";
import Dropdown from "../components/Dropdown.svelte";
import { t } from "../l10n.svelte.ts";
import type { Snippet } from "svelte";
import { Portal } from "@jsrob/svelte-portal";
import Resizer from "../components/Resizer.svelte";

let {
	left,
	hideLeft = $bindable(false),
	leftWidth = $bindable(0.2),
	leftMinPx = 250,
	children,
	right,
	hideRight = $bindable(false),
	rightWidth = $bindable(0.2),
	rightMinPx = 300,
	layout: userLayout = () => {},
	...rest
}: SvelteHTMLElements["div"] & {
	left?: Snippet;
	hideLeft?: boolean;
	leftWidth?: number;
	leftMinPx?: number;
	children?: Snippet;
	right?: Snippet;
	hideRight?: boolean;
	rightWidth?: number;
	rightMinPx?: number;
	layout?: (div: HTMLDivElement) => void;
} = $props();
// svelte-ignore non_reactive_update
let div: HTMLDivElement;

const leftWidthVisible = $derived(hideLeft ? 0 : leftWidth);
const rightWidthVisible = $derived(hideRight ? 0 : rightWidth);

function showHide() {
	hideLeft = div.clientWidth * leftWidth < leftMinPx;
	hideRight = div.clientWidth * rightWidth < rightMinPx;
	userLayout(div);
}

const layout: Attachment = (div) => {
	const obs = new ResizeObserver(showHide);
	obs.observe(div);
	return () => (obs.disconnect());
};

$effect(() => showHide());
</script>

<div
	class="grid"
	style:--left-width={leftWidthVisible * 100 + "%"}
	style:--left-resizer-width={4}
	style:--right-width={rightWidthVisible * 100 + "%"}
	style:--right-resizer-width={4}
	{...rest}
	bind:this={div}
	{@attach layout}
>
	{#if hideLeft}
		<Portal target="#headerLeft">
			<Dropdown label={t("Left column")}>
				{#snippet icon()}
					<Toc />
				{/snippet}
				{@render left?.()}
			</Dropdown>
		</Portal>
	{:else}
		<aside class="left">
			{@render left?.()}
		</aside>
	{/if}
	<div class="resizer-left">
		<Resizer bind:value={leftWidth} min={leftMinPx} context={div} />
	</div>
	<main>
		{@render children?.()}
	</main>
	{#if !hideRight}
		<aside class="right">
			{@render right?.()}
		</aside>
	{/if}
	<div class="resizer-right">
		<Resizer bind:value={rightWidth} context={div} multiplier={-1} />
	</div>
</div>

<style>
.grid {
	display: grid;
	grid-template-columns:
		var(--left-width) --spacing(var(--left-resizer-width))
		1fr
		--spacing(var(--right-resizer-width)) var(--right-width);
	grid-template-areas: "left leftResizer main rightResizer right";
	position: relative;

	& > .left {
		position: sticky;
		top: calc(var(--header-height) + --spacing(2));
		max-height: calc(100vh - var(--header-height) - --spacing(2));
		z-index: 2;
		padding: 0 --spacing(2);
		grid-area: left;
	}

	.resizer-left {
		grid-area: leftResizer;
	}

	.resizer-right {
		grid-area: rightResizer;
	}

	& > main {
		grid-area: main;
	}

	& > .right {
		margin-right: --spacing(4);
		grid-area: right;
	}
}

</style>
