<script lang="ts">
import { settings } from "../../settings.svelte";
import { fromBookLang, findPos } from "./tree.svelte.ts";
import type { Child, Doc } from "./tree.svelte.ts";
import Loading from "../Loading.svelte";
import "./schema.css";

interface Props {
	book: string;
}

const { book }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");

let doc = $derived(fromBookLang(book, settings.locale));
</script>

{#snippet ele(c: Child | Doc)}
	{#if c.tag === "c"}
		<h1>{c.data}</h1>
	{:else if c.tag === "h"}
		<svelte:element this={`h${c.level + 1}`}>
			{c.text}
		</svelte:element>
	{:else if c.tag === "v"}
		<sup class="verse">{c.data}</sup>
	{:else if c.tag === "w"}
		{c.text}
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
