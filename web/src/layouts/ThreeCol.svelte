<script lang="ts">
// Reponsive 3-column layout with features
// https://en.wikipedia.org/wiki/Holy_grail_(web_design)
import { untrack, type Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";
import type { Attachment } from "svelte/attachments";
import Toc from "virtual:icons/lucide/table-of-contents";
import Dropdown from "../components/Dropdown.svelte";
import { t } from "../l10n.svelte.ts";
import { Portal } from "@jsrob/svelte-portal";
import Resizer from "../components/Resizer.svelte";
import { spacing } from "../helpers.ts";

type Col = {
	value: number;
	min: number;
	max?: number;
};

let {
	left,
	leftCol = $bindable({ min: 270, value: 300 }),
	children,
	centerMinPx = 300,
	right,
	rightCol = $bindable({ min: 300, value: 400 }),
	layout: userLayout = () => {},
	...rest
}: SvelteHTMLElements["div"] & {
	left?: Snippet;
	leftCol?: Col;
	children?: Snippet;
	centerMinPx?: number;
	right?: Snippet;
	rightCol?: Col;
	layout?: (div: HTMLDivElement) => void;
} = $props();
// svelte-ignore non_reactive_update
let div: HTMLDivElement;

let leftDividerWidth = $state(0);
let rightDividerWidth = $state(0);
let available = $state(0);

function layout() {
	const { clientWidth } = div;
	const dividerWidth = untrack(() => spacing(4));
	leftDividerWidth = rightDividerWidth = dividerWidth;

	let nextAvailable = clientWidth - centerMinPx;
	if (leftCol.value && nextAvailable >= leftCol.value) {
		nextAvailable -= leftCol.value - leftDividerWidth;
	} else leftCol.value = 0;
	if (rightCol.value && nextAvailable >= rightCol.value) {
		nextAvailable -= rightCol.value - rightDividerWidth;
	} else rightCol.value = 0;

	if (!leftCol.value && nextAvailable <= leftCol.min + dividerWidth) leftDividerWidth = 0;
	else nextAvailable -= dividerWidth;
	if (!rightCol.value && nextAvailable <= rightCol.min + dividerWidth) rightDividerWidth = 0;
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
	style:grid-template-columns={`${leftCol.value}px ${leftDividerWidth}px 1fr ${rightDividerWidth}px ${rightCol.value}px`}
	{...rest}
	bind:this={div}
	{@attach attachment}
>
	{#if leftCol.value}
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
	<div class="resizer-left">
		<Resizer
			bind:value={() => leftCol.value, v => leftCol.value = v < leftCol.min ? 0 : v}
			context={div}
			max={leftCol.value + available}
		/>
	</div>
	<main>
		{@render children?.()}
	</main>
	{#if rightCol.value}
		<aside class="right">
			{@render right?.()}
		</aside>
	{/if}
	<div class="resizer-right">
		<Resizer
			bind:value={() => rightCol.value, v => rightCol.value = v < rightCol.min ? 0 : v}
			context={div}
			max={rightCol.value + available}
			multiplier={-1}
		/>
	</div>
</div>

<style>
.grid {
	display: grid;
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
.m2 {
	margin: --spacing(2);
}
</style>
