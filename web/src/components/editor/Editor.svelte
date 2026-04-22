<script lang="ts">
import { t } from "../../l10n.svelte";
import { settings } from "../../settings.svelte";
import { db } from "../../workers/dispatcher.svelte";
import Loading from "../Loading.svelte";
import "./schema.css";

interface Props {
	book: string;
}

const { book }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");

type Word = {
	id: bigint;
	text: string;
};
type Doc = {
	id: bigint;
	lang: string;
	title: string;

	words: Word[];
};

let meta = $state<Doc | string>();
let tree = $state([
	{ c: 1 },
	{ h2: "The Creation" },
	{
		p: [
			{ id: 12, v: 1 },
			{ id: 13, text: "In " },
			{ id: 15, text: "the " },
			{ id: 16, pn: 123 },
		],
	},
]);
let outlineDoc = $state<bigint>();
let paraDoc = $state<bigint>();

// $effect(() => {
// 	async function foo() {
// 		const base = await db.run(`
// 			SELECT id, lang, name FROM scripture
// 			JOIN doc d ON d.id = doc
// 			WHERE book='${book}' AND lang='${settings.locale}';
// 		`);
// 		if (!base.length) {
// 			doc = t("Cannot find {book} in {locale}", {
// 				book,
// 				locale: settings.locale,
// 			});
// 			return;
// 		}
// 		doc = {
// 			id: base[0].id,
// 			lang: base[0].lang,
// 			title: base[0].name,
// 			words: [],
// 		};
// 		db.run(
// 			`
// 			SELECT id, text FROM word
// 			WHERE doc=${doc.id}
// 		`,
// 		).then((res) => {
// 			(doc as Doc).words = res as Word[];
// 		});
// 	}
// 	foo();
// });
</script>

<div
	class="nb-bible"
	{dir}
	class:hide-verse-num={settings.showVerseNum !== "true"}
	class:hide-footnotes={settings.showFootnotes !== "true"}
	data-chapter-display={settings.chapterNumDisplay}
>
	{#if typeof doc === "object"}
		{doc.words.map((w) => w.text).join("")}
	{:else if typeof doc === "string"}
		{doc}
		<!-- TODO: go to collection view -->
	{:else}
		<Loading />
	{/if}
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
