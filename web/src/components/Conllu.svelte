<script lang="ts">
	import {computePosition, flip, offset, shift, size} from '@floating-ui/dom';
	import type { conllu } from "@nerd-bible/core";
	import type * as z from "@nerd-bible/valio";

	type Sentences = z.Output<typeof conllu.normal>;
	type Paragraph = { class: string, sentences: Sentences };
	type Word = Sentences[number]["words"][number];

	interface Props {
		sentences: Sentences;
	}

	const { sentences }: Props = $props();

	// TODO: make clearer and faster
	const paragraphs = $derived(structuredClone(sentences).reduce((acc, s) => {
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

	// Popover
	let selected = $state.raw<Word | undefined>();
	let selectedRef: HTMLButtonElement | undefined;
	let tooltipRef: HTMLDivElement;
	let cleanup = () => {};

	function onWordClick(ev: MouseEvent | FocusEvent, w?: Word) {
		if (w && selected !== w) {
			selected = w;
			ev.stopImmediatePropagation();

			console.time("click");
			const reference = ev.target as HTMLButtonElement;

			selectedRef = reference;

			// console.log("click", w);
			// console.log("click", reference.className);
			const target = tooltipRef;
			// console.log("click", reference, target);
			computePosition(reference, target, {
				placement: "bottom",
				middleware: [
					offset(4), flip(), shift(), size({
					apply({ availableWidth, availableHeight, elements }) {
						// Change styles, e.g.
						Object.assign(elements.floating.style, {
							maxWidth: `${Math.max(0, availableWidth)}px`,
							maxHeight: `${Math.max(0, availableHeight)}px`,
						});
					},
				}),
				],
			}).then(({ x, y }) => {
				Object.assign(tooltipRef.style, {
					left: `${x}px`,
					top: `${y}px`,
				});
				console.timeEnd("click");
			});
		} else {
			if (!tooltipRef.contains(ev.target)) {
				selected = undefined;
				cleanup();
			}
		}
	}
	function focusableElements(root: HTMLElement | Document) {
		return root.querySelectorAll('a[href],button,input,textarea,select,details,[tabindex]:not([tabindex="-1"])');
	}
	function onKeyDown(ev: KeyboardEvent) {
		if (ev.key === "Escape") selected = undefined;
		if (ev.key === "Tab") {
			if (!selected || !selectedRef) return;
			const focusable = focusableElements(tooltipRef);
			if (!focusable.length) return;

			if ((ev.target as HTMLButtonElement)?.classList.contains("word")) {
				if (ev.shiftKey) {
					selected = undefined;
					return;
				} else {
					(focusable[0] as HTMLElement).focus();
					ev.preventDefault();
					return;
				}
			}
			if (!ev.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
				const allFocusable = focusableElements(document);
				for (let i = 0; i < allFocusable.length; i++) {
					if (allFocusable[i] === selectedRef) {
						const next = allFocusable[i + 1] || allFocusable[0];
						(next as HTMLElement).focus();
						ev.preventDefault();
						selected = undefined;
						return;
					}
				}
			}
			if (ev.shiftKey && document.activeElement === focusable[0]) {
				selectedRef.focus();
				ev.preventDefault();
				selected = undefined;
				return;
			}
		}
	}
</script>
<svelte:document onkeydown={onKeyDown} onclick={onWordClick} />
<div class="conllu">
	{#each paragraphs as p}
		<p dir="auto" class={p.class}>
			{#each p.sentences as s (s.headers.sent_id)}
				<span class="sentence" id={`s_${s.headers.sent_id}`}>
					{#each s.words as w (w.id)}
						<!--
							`selected` slows down click events by ~50ms because of svelte
							signal handling
							-->
						<button
							class="word"
							aria-expanded={w === selected}
							aria-controls="wordTooltip"
							data-id={w.id}
							onclick={(ev) => onWordClick(ev, w)}
						>
							{w.form}
						</button>{#if w.misc["SpaceAfter"] !== "No"}
							{" "}
						{/if}
					{/each}
				</span>
			{/each}
		</p>
	{/each}
</div>
<div
	class="tooltip"
	id="wordTooltip"
	bind:this={tooltipRef}
	style:display={selected ? "" : "none"}
	onblur={onWordClick}
>
	<button>something to interact with</button>
	<span>{JSON.stringify(selected, null, 2)}</span>
	<button>something to interact with</button>
</div>
<style>
.word {
	display: inline-block;
	background: none;
	padding: 0;
	margin: 0;
}
.tooltip {
	white-space: pre-wrap;
	overflow: auto;
	position: absolute;
	top: 0;
	left: 0;
	background: var(--color-bg-300);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);
	z-index: 10;
}
</style>
