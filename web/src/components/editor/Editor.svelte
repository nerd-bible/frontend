<script lang="ts">
import { settings } from "../../settings.svelte";
import { fromBookLang, findPos } from "./tree.svelte.ts";
import type { Child, Doc } from "./tree.svelte.ts";
import Loading from "../Loading.svelte";
import "./schema.css";
import { t } from "../../l10n.svelte.ts";

interface Props {
	book: string;
}

const { book }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");
let doc = $derived(fromBookLang(book, settings.locale));
</script>

{#snippet ele(c: Child | Doc)}
	{#if c.tag === "c"}
		<h2><span><span class="t">{t("Chapter ")}</span>{c.data}</span></h2>
	{:else if c.tag === "h"}
		<svelte:element this={`h${c.level + 2}`}>
			{c.text}
		</svelte:element>
	{:else if c.tag === "v"}
		<sup class="verse-num">{c.data}</sup>
	{:else if c.tag === "w"}
		{c.text}
	{:else if c.tag === "words"}
		{c.children.map(c => c.text).join("")}
	{:else if "children" in c}
		{#each c.children as c2}
			{@render ele(c2)}
		{/each}
	{/if}
{/snippet}

<div
	class="nb-bible"
	{dir}
	class:hide-verse-num={settings.showVerseNum !== "true"}
	class:hide-footnotes={settings.showFootnotes !== "true"}
	data-chapter-display={settings.chapterNumDisplay}
>
	{#await doc}
		<Loading />
	{:then d}
		<h1>{d.title}</h1>
		{@render ele(d)}
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
