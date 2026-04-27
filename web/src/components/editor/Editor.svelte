<script lang="ts">
import { settings } from "../../settings.svelte";
import { docFromBookLang } from "./tree.svelte.ts";
import Loading from "../Loading.svelte";
import * as T from "./tree.ts";
import { toUrl } from "../../routes.ts";
import { t } from "../../l10n.svelte.ts";

interface Props {
	book: string;
}

const { book }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");
let doc = $derived(docFromBookLang(book, settings.locale));
</script>

<div
	class="nb-bible"
	{dir}
	class:hide-verse={settings.showVerseNum !== "true"}
	class:hide-footnotes={settings.showFootnotes !== "true"}
	data-chapter-display={settings.chapterNumDisplay}
>
	{#await doc}
		<Loading />
	{:then d}
{#snippet render(n: any)}
	{#if n instanceof T.Word}
		<span class="word" data-pos={n.pos}>{n.text}</span>
	{:else if n instanceof T.Chapter}
		<h2><span><span class="t">{t("Chapter ")}</span>{n.number}</span></h2>
	{:else if n instanceof T.Verse}
		<sup class="verse">{n.number}</sup>
	{:else if n instanceof T.Outline}
		<svelte:element this={`h${n.level + 2}`}>{n.text}</svelte:element>
	{:else if n instanceof T.Note}
		<sup data-doc={n.doc}></sup>
	{:else if n instanceof T.Ref}
		<a href={toUrl(n.ref)}>{n.text}</a>
	{:else if n instanceof T.Paragraph}
		<div role="paragraph" {...n.props}>
			{#each n.children as c}
				{@render render(c)}
			{/each}
		</div>
	{:else if n instanceof T.Words}
		<span class="words" data-pos={n.pos}>
			{n.children.map((c) => c.text).join("")}
		</span>
	{:else if n instanceof T.List}
		<ul>
			{#each n.children as c}
				<li>{@render render(c)}</li>
			{/each}
		</ul>
	{:else if n instanceof T.Mark}
		<svelte:element this={n.tag} {...n.props}>
			{#each n.children as c}
				{@render render(c)}
			{/each}
		</svelte:element>
	{:else if n instanceof T.Doc}
		<article>
			<h1>{n.meta.title}</h1>
			{#each n.children as c}
				{@render render(c)}
			{/each}
		</article>
	{:else}
		{@debug n}
		cannot render
	{/if}
{/snippet}
{@render render(d)}
	{:catch error}
		<pre>{error.message}</pre>
		<!-- TODO: go to collection view -->
	{/await}
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
.nb-bible {
	/* Offset allows room for verse and inline chapter numbers */
	line-height: calc(var(--font-size) + var(--line-height-offset));

	/* h2 = chapter number */
	/* h3-h6 = outline heading */

	&.hide-verse .verse,
	&.hide-footnotes .footnote,
	&[data-chapter-display="Float"] h2 + p > .verse {
		display: none;
	}

	p:not(:last-child) {
		margin-bottom: --spacing(4);
	}

	h1, h2, h3, h4, h5, h6 {
		text-align: center;
		user-select: none;
		line-height: normal;
	}

	&[data-chapter-display="Normal"] h2 {
		line-height: normal;
		margin-bottom: --spacing(1);

		&:first-child {
			margin-top: 0;
		}
	}
	&[data-chapter-display="Float"] h2 {
		float: inline-start;
		margin-inline-start: --spacing(-1);
		margin-inline-end: --spacing(5);
		/* eyeballed to be about two lines tall for inline */
		/* must keep in sync with font-size */
		padding-top: calc((var(--font-size) + var(--line-height-offset)) / 2);

		& .t {
			display: none;
		}
	}
	&[data-chapter-display="Float"] h2 + p {
		/* make space for chapter number */
		min-height: calc((var(--font-size) + var(--line-height-offset)) * 2);
	}
	&[data-chapter-display="None"] h2 {
		display: none;
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
	}

	p {
		/* follow dir instead of being all smart */
		unicode-bidi: bidi-override;
	}

	.verse {
		&::before { 
			content: " ";
		}
		opacity: 0.75;
		margin-inline-end: 2px;
		& ~ * {
			margin-inline-end: -2px;
		}
	}
}
</style>
