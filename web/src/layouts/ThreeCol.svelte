<script lang="ts">
// Reponsive 3-column layout with features
// https://en.wikipedia.org/wiki/Holy_grail_(web_design)
import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";
import type { Attachment } from "svelte/attachments";
import Toc from "virtual:icons/lucide/table-of-contents";
import Dropdown from "../components/Dropdown.svelte";
import { t } from "../l10n.svelte.ts";
import { Portal } from "@jsrob/svelte-portal";
import Resizer from "../components/Resizer.svelte";
import { settings } from "../settings.svelte.ts";

let {
	left,
	leftColMin = 270,
	leftCol = $bindable(300),
	children,
	centerMinPx = 300,
	right,
	rightColMin = 300,
	rightCol = $bindable(400),
	layout: userLayout = () => {},
	...rest
}: SvelteHTMLElements["div"] & {
	left?: Snippet;
	leftColMin?: number;
	leftCol?: number;
	children?: Snippet;
	centerMinPx?: number;
	right?: Snippet;
	rightColMin?: number;
	rightCol?: number;
	layout?: (div: HTMLDivElement) => void;
} = $props();
// svelte-ignore non_reactive_update
let div: HTMLDivElement;

let leftResizerWidth = $state(0);
let rightResizerWidth = $state(0);
let available = $state(0);

function layout() {
	const { clientWidth } = div;
	const dividerWidth = 32;
	leftResizerWidth = rightResizerWidth = dividerWidth;

	let nextAvailable = clientWidth - centerMinPx;
	if (leftCol && nextAvailable >= leftCol) {
		nextAvailable -= leftCol - leftResizerWidth;
	} else leftCol = 0;
	if (rightCol && nextAvailable >= rightCol) {
		nextAvailable -= rightCol - rightResizerWidth;
	} else rightCol = 0;

	if (!leftCol && nextAvailable <= leftColMin + dividerWidth)
		leftResizerWidth = 0;
	else nextAvailable -= dividerWidth;
	if (!rightCol && nextAvailable <= rightColMin + dividerWidth)
		rightResizerWidth = 0;
	else nextAvailable -= dividerWidth;

	available = nextAvailable;
	userLayout(div);
}

const attachment: Attachment = (div) => {
	const obs = new ResizeObserver(layout);
	obs.observe(div);
	return () => obs.disconnect();
};

$effect(() => layout());
</script>

<div
	class="grid"
	style:--left-width={leftCol + "px"}
	style:--left-resizer-width={leftResizerWidth + "px"}
	style:--right-width={rightCol + "px"}
	style:--right-resizer-width={rightResizerWidth + "px"}
	{...rest}
	bind:this={div}
	{@attach attachment}
>
	{#if leftCol}
		<aside class="left scrollable">
			{@render left?.()}
		</aside>
	{:else}
		<Portal target="#headerLeft">
			<Dropdown label={t("Left column")}>
				{#snippet icon()}
					<Toc />
				{/snippet}
				<div class="scrollable m2">
					{@render left?.()}
				</div>
			</Dropdown>
		</Portal>
	{/if}
	{#if leftResizerWidth}
		<div class="resizer-left">
			<Resizer
				disabled={settings.lockLayout}
				bind:value={
					() => leftCol, (v) => (leftCol = v < leftColMin ? 0 : v)
				}
				context={div}
				max={leftCol + available}
			/>
		</div>
	{/if}
	<main>
		{@render children?.()}
	</main>
	{#if rightCol}
		<aside class="right">
			{@render right?.()}
		</aside>
	{/if}
	{#if rightResizerWidth}
		<div class="resizer-right">
			<Resizer
				disabled={settings.lockLayout}
				bind:value={
					() => rightCol,
					(v) => (rightCol = v < rightColMin ? 0 : v)
				}
				context={div}
				max={rightCol + available}
				multiplier={-1}
			/>
		</div>
	{/if}
</div>

<style>
.grid {
	display: grid;
	grid-template-columns:
		var(--left-width) var(--left-resizer-width)
		1fr
		var(--right-resizer-width) var(--right-width);
	grid-template-areas: "left leftResizer main rightResizer right";
	position: relative;

	& > .left {
		position: sticky;
		top: var(--header-height);
		max-height: calc(100vh - var(--header-height));
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
.m2 {
	margin: --spacing(2);
}

/* TODO: container */
@media(width < 750px) {
	.grid {
		margin-inline-start: --spacing(2);
		margin-inline-end: --spacing(2);

		&:has(> .resizer-left) {
			margin-inline-start: 0;
		}

		&:has(> .resizer-right) {
			margin-inline-end: 0;
		}
	}
}

/* .collapse { */
/* 	background: var(--color-bg-200); */
/* 	opacity: 0.5; */
/* } */
</style>
