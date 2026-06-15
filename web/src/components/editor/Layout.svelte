<script lang="ts">
// Reponsive 3-column layout with features
import type { SvelteHTMLElements } from "svelte/elements";
import type { Attachment } from "svelte/attachments";
import { PaneResizer } from "../panes/index.ts";
import Toc from "virtual:icons/lucide/table-of-contents";
import Dropdown from "../Dropdown.svelte";
import { t } from "../../l10n.svelte.ts";

const {
	col1,
	col2,
	col3,
	...rest
}: SvelteHTMLElements["div"] & {
	col1: Snippet;
	col2: Snippet;
	col3: Snippet;
} = $props();

let hideLeft = $state(false);
let hideRight = $state(false);

const layout: Attachment = (div) => {
	const parentRect = div.getBoundingClientRect();
	const sameLineNoteStyles = ["wavy", "dashed", "dotted", "none"];

	function layoutNotes() {
		let lastY = 0;
		let lastHeight = 0;
		let overlapping = 0;
		const ch = 11.43;
		hideLeft = div.clientWidth < 130 * ch;
		hideRight = div.clientWidth < 80 * ch;
		if (!hideRight) {
			div.querySelectorAll("mark").forEach((mark) => {
				const fromRects = mark.getClientRects();
				const rect = fromRects[fromRects.length - 1];
				const y = Math.max(lastY + lastHeight, rect.top - parentRect.top);
				const note = mark.ariaDetailsElements![0] as HTMLElement;

				let style = "solid";
				if (y === lastY + lastHeight)
					style = sameLineNoteStyles[overlapping++ % sameLineNoteStyles.length];
				else overlapping = 0;
				mark.style.textDecorationStyle = style;
				note.style.textDecorationStyle = style;
				note.style.top = y + "px";
				note.style.position = "absolute";

				lastY = y;
				lastHeight = note.clientHeight;
			});
		}
	}

	layoutNotes();
	const obs = new ResizeObserver(layoutNotes);
	obs.observe(div);

	return () => {
		obs.disconnect();
	};
};
</script>

<div class="grid" class:two={hideLeft} class:one={hideRight} {...rest} {@attach layout}>
	<aside class="left">
		{#if hideLeft}
			{#snippet icon()}
				<Toc />
			{/snippet}
			<Dropdown label={t("Reader menu")} {icon}>
				{@render col1()}
			</Dropdown>
		{:else}
			{@render col1()}
		{/if}
	</aside>
	<div></div>
	<main>
		{@render col2()}
	</main>
	<div></div>
	<aside class="right">
		{@render col3()}
	</aside>
</div>

<style>
.grid {
	font-size: var(--font-size);
	line-height: var(--line-height);
	display: grid;
	grid-template-columns: var(--grid-template-columns);
	position: relative;

	& > .left {
		position: sticky;
		top: var(--header-height);
		max-height: calc(100vh - var(--header-height));
		overflow: auto;
		z-index: 2;
		height: 100%;
		padding: 0 --spacing(2);

		:global(.dropdown) {
			& > :global(.content) {
				inset-inline-start: 0;
				inset-inline-end: auto;
				width: max-content;
			}
		}
	}

	& > .right {
		margin-right: --spacing(4);
	}
}

.two {
	--grid-template-columns: 0px 0px minmax(auto, 80ch) --spacing(8) minmax(20ch, 1fr);

	& > .left {
		max-height: calc(100vh - var(--header-height) - --spacing(24));
	}
}

.one {
	--grid-template-columns: 0px 0px 1fr;

	& > :global(.main-resizer),
	& > .right {
		display: none;
	}
}
</style>
