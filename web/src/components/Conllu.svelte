<script lang="ts">
	import type { conllu } from "@nerd-bible/core";
	import type * as z from "@nerd-bible/valio";

	type Sentences = z.Output<typeof conllu.normal>;
	type Paragraph = { class: string, sentences: Sentences };
	type Word = Sentences[number]["words"][number];

	interface Props {
		sentences: Sentences;
	}

	const { sentences }: Props = $props();
	let dir = $state<"ltr" | "rtl">("rtl");

	// TODO: make clearer and faster
	const paragraphs = $derived(sentences.reduce((acc, s) => {
		const newpar = s.headers["newpar"];
		if (newpar != null || acc.length === 0) {
			acc.push({
				class: newpar,
				sentences: [],
			});
		}
		s.words = s.words.filter(w => {
			if (typeof w.id === "string") {
				const [start, end] = w.id.split("-");
				const startN = Number.parseFloat(start);
				const endN = Number.parseFloat(end);
				if (endN > startN) {
					for (const w2 of s.words) {
						if (typeof w2.id !== "number") continue;

						if (w2.id >= startN && w2.id < endN || (w2.id === endN && w.misc["SpaceAfter"] === "No")) {
							w2.misc["SpaceAfter"] = "No";
						}
					}
				}
				return false;
			}
			return w.form.length;
		});
		acc[acc.length - 1].sentences.push(s);
		if (s.words.length) {
			const lastLemma = s.words[s.words.length - 1].lemma;
			if (lastLemma === "פ" || lastLemma === "ס") {
				s.words.pop();
				acc.push({ class: lastLemma, sentences: [] });
			}
		}

		return acc;
	}, [] as Paragraph[]));

	$inspect(paragraphs);

	let selected = $state.raw<Word | undefined>();
	function onWordClick(ev: MouseEvent, w: Word) {
		selected = w;
	}
</script>
<div {dir} class="conllu">
{#each paragraphs as p}
	<p class={p.class}>
		{#each p.sentences as s}
			<span class="sentence">
				{#each s.words as w}
					<!-- <nb-dropdown class="word"> -->
					<!-- 	<button> -->
					<button onclick={(ev) => onWordClick(ev, w)}>
						{w.form}
					</button>{#if
						w.misc["SpaceAfter"] !== "No"
					}{" "}
					{/if}{#if selected === w
					}
						<span>{JSON.stringify(w)}</span>
					{/if}
					<!-- 	</button> -->
					<!-- 	<span class="content"> -->
					<!-- 		info -->
					<!-- 	</span> -->
					<!-- </nb-dropdown> -->
				{/each}
			</span>
		{/each}
	</p>
{/each}
</div>
<style>
.sentence > button {
	display: inline-block;
	background: none;
	padding: 0;
	margin: 0;
}
.conllu {
	white-space: pre-wrap;
}
</style>
