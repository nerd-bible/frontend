<script lang="ts">
import { settings } from "../../settings.svelte";
import sample from "../../genesis.html?raw";
// import { docFromBookLang } from "./tree.svelte.ts";
// https://jsfiddle.net/4o73hgwu/7/
interface Props {
	book: string;
}

const { book }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");
// let doc = $derived(docFromBookLang(book, settings.locale));
</script>

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
>
	{@html sample}
	<div class="empty"></div>
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

	p {
		/* follow dir instead of being all smart */
		unicode-bidi: bidi-override;

		margin-top: --spacing(1);
		margin-bottom: --spacing(4);
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
	h2 { font-size: 1.75em; }
	h3 { font-size: 1.5em; }
	h4 { font-size: 1.25em; }
	h5 { font-size: 1em; }
	h6 { font-size: 1em; }

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
		& > .verse:first-of-type {
			display: none;
		}
		&::first-letter {
			float: inline-start;
			font-size: 3.2em;
			line-height: 1;
			font-weight: bold;
			margin-right: 0.1em;
		}
	}
}
}
</style>
