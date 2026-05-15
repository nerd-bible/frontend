<script lang="ts">
import { onMount } from "svelte";
import { settings } from "../../settings.svelte";
import sample from "../../genesis.html?raw";
import {
	computePosition,
	autoUpdate,
	offset,
	inline,
	shift,
} from "@floating-ui/dom";
import type { Attachment } from 'svelte/attachments';
// import { docFromBookLang } from "./tree.svelte.ts";

// https://jsfiddle.net/4o73hgwu/7/
interface Props {
	book: string;
}

const { book }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");
// let doc = $derived(docFromBookLang(book, settings.locale));
let svg: SVGElement;
let div: HTMLDivElement;
let rects: { x: number; y: number; width: number; height: number }[] = $state(
	[],
);
let paths: string[] = $state([]);
onMount(() => {
	const parentBounds = div.getBoundingClientRect();
	div.querySelectorAll("mark").forEach((m) => {
		const from = m.getBoundingClientRect();
		const fromRect = {
			x: from.x - 8,
			y: from.y - parentBounds.y,
			width: from.width,
			height: from.height,
		};
		const to = m.nextElementSibling!.getBoundingClientRect();
		const toRect = {
			x: to.x - 8,
			y: to.y - parentBounds.y,
			width: to.width,
			height: to.height,
		};
		rects.push(fromRect);
		rects.push(toRect);
		const fromBottomLeft = [fromRect.x, fromRect.y + fromRect.height];
		const toBottomRight = [toRect.x + toRect.width, toRect.y + toRect.height];
		const halfway = [
			(fromBottomLeft[0] + toBottomRight[0]) / 2,
			toRect.y + toRect.height + 8,
		];
		const xy = ([x, y]: number[]) => `${x},${y}`;
		paths.push(`M${xy(fromBottomLeft)} Q${xy(halfway)} ${xy(toBottomRight)}`);
	});
});

const myAttachment: Attachment = (element) => {
	console.log(element.nodeName);

	return () => {
		console.log('cleaning up');
	};
};
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="wrapper" {@attach myAttachment}>
	<div class="toc">Table of contents</div>
	<div
		class="editor"
		{dir}
		class:hide-verse={settings.showVerseNum !== "true"}
		class:hide-footnotes={settings.showFootnotes !== "true"}
		class:drop-caps={settings.showDropCaps === "true"}
		data-chapter-display={settings.chapterNumDisplay}
		style:--column-width={`${settings.columnWidth}px`}
		style:--column-gap={`${settings.columnGap}px`}
		style:--font-size={`${settings.fontSize}px`}
		style:--line-height={settings.lineHeight}
		onclick={(ev) => {
			const target = ev.target as HTMLElement;
			if (target.tagName === "BUTTON") {
				const reference = new Range();
				reference.setStartBefore(target);
				reference.setEndAfter(target);

				const computed = getComputedStyle(document.body);
				const remToPx = (rem: string) =>
					parseFloat(rem) * parseFloat(computed.fontSize);
				const spacing = remToPx(computed.getPropertyValue("--spacing-inc"));

				const middleware = [
					offset(spacing * 2), // from `placement`
					// flip(), // to opposite of `placement` if cannot fit
					shift({
						padding: {
							left: parseFloat(computed.paddingLeft),
							right: parseFloat(computed.paddingRight),
							// needs to be taller than header because appears under header
							// this is difficult to fix because of stacking contexts
							// TODO: make stack above header and change to same as bottom
							top: spacing * 14,
							bottom: spacing * 2,
						},
					}),
					inline({ padding: 0 }),
				];

				const tooltipRef = target.nextElementSibling as HTMLElement;
				const update = () =>
					computePosition(reference, tooltipRef, {
						placement: "top",
						middleware,
					}).then(({ x, y }) => {
						tooltipRef.style.left = `${x}px`;
						tooltipRef.style.top = `${y}px`;
						tooltipRef.style.display = "flex";
					});
				const cleanup = autoUpdate(reference, tooltipRef, update);

				// const selection = window.getSelection();
				// selection?.addRange(range);
			}
		}}
		bind:this={div}
	>
		{@html sample}
	</div>
	<div class="notes"></div>

	<svg
		bind:this={svg}
		xmlns="http://www.w3.org/2000/svg"
		stroke="red"
		fill="none"
	>
		{#each rects as r}
			<rect x={r.x} y={r.y} width={r.width} height={r.height} />
		{/each}
		{#each paths as d}
			<path {d} />
		{/each}
	</svg>
</div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- <div -->
<!-- 	class="tooltip" -->
<!-- 	bind:this={tooltipRef} -->
<!-- 	onmousedown={(ev) => ev.preventDefault()} -->
<!-- > -->
<!-- 	{#each Object.keys(settings.userHighlights) as k} -->
<!-- 		<button -->
<!-- 			onclick={() => { -->
<!-- 				if (!view) return; -->
<!---->
<!-- 				const { from, to } = view.state.selection; -->
<!-- 				view?.dispatch( -->
<!-- 					view.state.tr.setMeta("annotate", { from, to, class: k }), -->
<!-- 				); -->
<!-- 				document.getSelection()?.removeAllRanges(); -->
<!---->
<!-- 				// const decoSet: DecorationSet = key.getState(view.state); -->
<!-- 				// const decos = decoSet.find(from, to); -->
<!-- 				// console.log(decos); -->
<!-- 			}} -->
<!-- 		> -->
<!-- 			{k} -->
<!-- 		</button> -->
<!-- 	{/each} -->
<!-- 	<button -->
<!-- 		onclick={() => { -->
<!-- 			settings.userHighlights["pink"] = { -->
<!-- 				"background-color": "rgb(255,192,203)", -->
<!-- 			}; -->
<!-- 		}}>add</button -->
<!-- 	> -->
<!-- </div> -->

<style>
.wrapper {
	max-width: 100%;
	position: relative;
	display: flex;
	gap: --spacing(2);

	& > *:not(svg) {
		z-index: 2;
	}
}
.toc {
	flex-shrink: 1;
	padding: --spacing(4) 0;
}
.notes {
	flex-grow: 1;
}
:global {
	.editor {
		font-size: var(--font-size);
		line-height: var(--line-height);

		/* Failed double column experiment */
		/* column-width: calc((100vw + var(--spacing-inc) * 16) / 3); */
		/* column-gap: 1rem; */
		/* height: calc(100vh - 54px); */
		/* column-rule: solid var(--column-gap) red; */
		/* orphans: 1; */
		/* widows: 1; */
		/* overflow: auto; */
		/* scroll-behavior: auto; */
		/* scrollbar-width: none; */
		/* &::-webkit-scrollbar { */
		/* 	display: none; */
		/* } */
		width: var(--column-width);

		&.hide-verse .verse,
		&.hide-footnotes .footnote,
		&[data-chapter-display="None"] h2,
		& > h1 + .chapter > h2 {
			display: none;
		}

		p,
		ol,
		ul,
		blockquote,
		div {
			/* follow dir instead of being all smart */
			unicode-bidi: bidi-override;

			margin-top: --spacing(1);
			margin-bottom: --spacing(4);
		}

		ol.inline,
		ul.inline {
			display: inline;
			margin: 0;
			& > li {
				display: inline;
				margin: 0;
			}
		}

		.verse {
			&::before {
				content: " ";
			}
			opacity: 0.5;
			margin-inline-end: 2px;
			/* & ~ * { margin-inline-end: -2px; } */
		}

		/* h1 = title */
		/* h2 = chapter number */
		/* h3-h6 = outline heading */
		h1 {
			text-align: center;
			font-weight: bolder;
		}
		h2,
		h3,
		h4,
		h5,
		h6 {
			opacity: 0.5;
		}
		h2 {
			font-size: 1.75em;
		}
		h3 {
			font-size: 1.5em;
		}
		h4 {
			font-size: 1.25em;
		}
		h5 {
			font-size: 1em;
		}
		h6 {
			font-size: 1em;
		}

		&[data-chapter-display="Normal"] h2 {
			line-height: normal;
			margin-bottom: --spacing(1);

			&:first-child {
				margin-top: 0;
			}
		}
		&[data-chapter-display="Small"] h2 {
			opacity: 0.5;
			font-size: 0.75em;
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: --spacing(4);

			&::before,
			&::after {
				content: "";
				flex-grow: 1;
				/* width: --spacing(12); */
				border-bottom: 1px solid;
			}
			padding: --spacing(2) 0;
		}

		&.drop-caps > .chapter > p:first-of-type {
			min-height: 2lh;
			& > .verse:first-of-type {
				display: none;
			}
			&::first-letter {
				float: inline-start;
				font-size: 2lh;
				line-height: 1;
				font-weight: bold;
				margin-inline-end: 0.1em;
			}
		}

		small {
			--width: calc(
				(100vw - var(--column-width) - var(--spacing-inc) * 24) / 2
			);
			font-size: inherit;
			position: relative;
			width: var(--width);
			float: inline-end;
			margin-inline-end: calc(-1 * var(--width) - var(--spacing-inc) * 8);
		}

		button {
			text-decoration-line: underline;
			text-decoration-style: wavy;
			text-decoration-skip-ink: none;
			text-decoration-color: green;
			padding: 0;
			background: none;
		}

		mark {
			background: none;
			color: inherit;
		}

		blockquote {
			padding-inline-start: --spacing(8);
		}

		.poetry > *,
		.line-group > *,
		ol:not(.inline) > li,
		ul:not(.inline) > li {
			/* white-space: nowrap; */
			/* word-break: break-word; */
			text-indent: --spacing(-8);
			padding-inline-start: --spacing(8);
		}

		.poetry > *,
		.line-group > * {
			margin: 0;
		}
	}
}

:global(.tooltip) {
	display: none;
	position: absolute;
	background: var(--color-bg-300);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);

	gap: --spacing(1);
	padding: --spacing(2);
	width: max-content;
	/* keep in sync with body left + right padding */
	max-width: calc(100vw - --spacing(8));
	/* above other editor content but below header */
	z-index: 2;

	/* If need to remove overflow-x hidden on body, add these + inner wrapper element: */
	/* https://stackoverflow.com/questions/9933092/css-prevent-absolute-positioned-element-from-overflowing-body */
	/* right: 0; */
	/* overflow: hidden; */
}

svg {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	z-index: 1;
}
</style>
