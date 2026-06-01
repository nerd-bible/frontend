<script lang="ts">
import { settings } from "../../settings.svelte";
import sample from "../../genesis.html?raw";
import Tabs from "../Tabs.svelte";
import Outline from "./Outline.svelte";
import Layers from "./Layers.svelte";
import View from "./View.svelte";
import { computePosition, offset, inline, shift } from "@floating-ui/dom";
import type { Attachment } from "svelte/attachments";
import { t } from "../../l10n.svelte";
import { PaneGroup, Pane, PaneResizer } from "../panes/index.ts";
// import { docFromBookLang } from "./tree.svelte.ts";

// https://github.com/aleventhal/aria-annotations/blob/master/README.md#simplified-aria-annotations-proposal--explainer
// https://jsfiddle.net/4o73hgwu/7/
// interface Props {
// 	book: string;
// }
// const { book }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");
let tooltipRef: HTMLDivElement;
let tooltipPos = $state({ left: 0, top: -100 });
let selectedNote = $state<HTMLElement>();
// let doc = $derived(docFromBookLang(book, settings.locale));
let paths = $state<string[]>([]);
let inlineNotes = $state(false);

function layoutTooltip() {
	const reference = selectedNote;
	if (!reference) return;
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

	computePosition(reference, tooltipRef, {
		placement: "top",
		middleware,
	}).then(({ x, y }) => {
		tooltipPos.left = x;
		tooltipPos.top = y;
	});
}

const layoutNotes: Attachment = (div) => {
	const parentRect = div.getBoundingClientRect();
	const sameLineNoteStyles = ["wavy", "dashed", "dotted", "none"];

	function layout() {
		let lastY = 0;
		let lastHeight = 0;
		let overlapping = 0;
		inlineNotes =
			div.clientWidth - +settings.columnWidth * 2 < +settings.fontSize * 12;
		if (settings.showFootnotes === "false") return;
		if (inlineNotes) layoutTooltip();
		else {
			tooltipPos.top = -100;
			selectedNote = undefined;

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
				note.style.position = "absolute";
				note.style.top = y + "px";

				lastY = y;
				lastHeight = note.clientHeight;
			});
		}
	}

	layout();
	const obs = new ResizeObserver(layout);
	obs.observe(div);

	return () => {
		obs.disconnect();
	};
};

function highlight(ele: HTMLElement) {
	ele.classList.add("focus");
	const animations = ele.getAnimations();
	animations.forEach((anim) => {
		anim.cancel(); // Stop the current instance
		anim.play(); // Restart from the beginning
	});
}

function highlightNote(ev: MouseEvent) {
	const ele = ev.currentTarget as HTMLElement;
	const referencedBy = document.querySelectorAll(`[aria-details=${ele.id}]`);
	for (let i = 0; i < referencedBy.length; i++)
		highlight(referencedBy[i] as HTMLElement);
}
</script>

<svelte:document
	onclick={(ev) => {
		if (!tooltipRef.contains(ev.target as HTMLElement)) {
			selectedNote = undefined;
			tooltipPos.top = -100;
		}
	}}
/>
<PaneGroup
	class={{
		wrapper: true,
		"inline-notes": inlineNotes,
		"hide-footnotes": settings.showFootnotes !== "true",
	}}
	style={`--line-height:${settings.lineHeight};--font-size:${settings.fontSize}px;`}
	{@attach layoutNotes}
>
	<Pane class="sticky" width="400px" minWidth={300} collapsible>
		<aside>
			<Tabs
				items={[
					{ label: t("Outline"), component: Outline },
					{ label: t("View"), component: View },
					{ label: t("Layers"), component: Layers },
				]}
			/>
		</aside>
	</Pane>
	<PaneResizer />
	<Pane class="main" width="70ch" minWidth={400}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<main
			class="editor"
			{dir}
			class:hide-verse={settings.showVerseNum !== "true"}
			class:hide-chapter={settings.showChapterNum !== "true"}
			class:hide-outline={settings.showOutline !== "true"}
			class:drop-caps={settings.showDropCaps === "true"}
			onclick={(ev) => {
				const mark = ev.target as HTMLElement;
				if (settings.showFootnotes === "true" && mark.tagName === "MARK") {
					const note = mark.ariaDetailsElements![0] as HTMLElement;
					if (inlineNotes) {
						const cloned = note.cloneNode(true) as HTMLElement;
						cloned.removeAttribute("id");
						tooltipRef.replaceChildren(cloned);
						selectedNote = mark;
						ev.stopPropagation();
					} else {
						highlight(note);
					}
				}
			}}
		>
			{@html sample}
		</main>
	</Pane>
	<PaneResizer />
	<Pane minWidth={400}>
		<aside
			role="note"
			class="notes"
			class:hide-footnotes={settings.showFootnotes !== "true"}
		>
			<a
				href="javascript:void(0)"
				class="footnote"
				id="pnote1"
				onclick={highlightNote}
			>
				Literally <i>day one</i>
			</a>
			<a
				href="javascript:void(0)"
				class="footnote"
				id="pnote2"
				onclick={highlightNote}
			>
				Or a canopy or a firmament or a vault
			</a>
		</aside>
	</Pane>
	<PaneResizer />

	<svg xmlns="http://www.w3.org/2000/svg" stroke="red" fill="none">
		{#each paths as d}
			<path {d} />
		{/each}
	</svg>
</PaneGroup>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="tooltip"
	bind:this={tooltipRef}
	style:display={settings.showFootnotes == "true" ? null : "none"}
	style:top={tooltipPos.top + "px"}
	style:left={tooltipPos.left + "px"}
	onmousedown={(ev) => ev.preventDefault()}
></div>

<style>
:global {
	.wrapper {
		font-size: var(--font-size);
		line-height: var(--line-height);
		position: relative;
		height: 100%;
		overflow: auto;
		scrollbar-gutter: stable;
	}
	.editor {
		counter-reset: chapter;
		padding-bottom: --spacing(4);

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

		&.hide-verse .verse {
			display: none;
		}

		p,
		ol,
		ul,
		blockquote,
		div {
			/* follow dir instead of being all smart */
			unicode-bidi: bidi-override;

			margin-block-end: 0.5lh;
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
			margin-top: calc(2lh / 9);
			margin-bottom: calc(1lh / 9);
		}
		h1:has(+ h2),
		h2:has(+ h3),
		h3:has(+ h4),
		h4:has(+ h5),
		h5:has(+ h6) {
			margin: 0;
		}
		h1 + h2,
		h2 + h3,
		h3 + h4,
		h4 + h5,
		h5 + h6 {
			margin-top: 0;
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
		&.hide-outline {
			h2,
			h3,
			h4,
			h5,
			h6 {
				display: none;
			}
		}

		&:not(.hide-chapter) > .chapter {
			& > h2:first-child,
			& > h3:first-child,
			& > h4:first-child,
			& > h5:first-child,
			& > h6:first-child {
				margin-top: 0;
			}
			&::before {
				opacity: 0.5;
				font-size: 1.75em;
				counter-increment: chapter;
				content: "Chapter " counter(chapter);
				display: block;
				margin-block-end: --spacing(1);
			}
		}

		&:not(.hide-chapter) > .chapter,
		&.drop-caps > .chapter {
			margin-bottom: 1lh;
		}

		&.drop-caps > .chapter > p:first-of-type {
			& > .verse:first-of-type {
				display: none;
			}
			&::first-letter {
				font-size: 2lh;
				line-height: 1;
				font-weight: bold;
				margin-inline-end: 0.1em;
			}
		}

		.poetry,
		.line-group,
		ol:not(.inline),
		ul:not(.inline) {
			margin-inline-start: --spacing(8);

			& > * {
				/* white-space: nowrap; */
				/* word-break: break-word; */
				text-indent: --spacing(-8);
				padding-inline-start: --spacing(8);
			}
		}

		blockquote {
			margin-inline-start: --spacing(8);
		}

		.line-group,
		.poetry {
			& > p {
				margin: 0;
			}
		}
	}

	.sticky {
		height: 100%;
		top: 0;
		position: sticky;
		& > aside {
			height: 100%;
			padding: 0 --spacing(2) --spacing(4) --spacing(2);
		}
	}

	mark {
		background: none;
		color: inherit;
	}
}

:global(.tooltip) {
	display: flex;
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

:global(.hide-footnotes .notes) {
	display: none;
}
:global(.wrapper):not(.hide-footnotes) .editor :global(mark),
.notes > * {
	&:global(.focus) {
		animation: focus 1s ease forwards;
	}
	text-decoration-color: var(--color-fg-500);
	text-decoration-line: underline;
}
.notes {
	margin-right: --spacing(4);
	& > * {
		display: block;
	}
}

@keyframes focus {
	from {
		background: var(--color-focus-100);
	}
	to {
		background: none;
	}
}

svg {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	z-index: -1;
}
</style>
