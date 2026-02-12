<script lang="ts">
	import { computePosition, flip, offset, shift, size, autoUpdate } from '@floating-ui/dom';
	import { onMount, tick } from "svelte";
	import { settings } from "../settings.svelte";
	import type { Table } from "@uwdata/flechette";

	type Word = {
		index: number,
		sentId: number,
		id: number,
		form: string,
		chapter: number | null,
		verse: string | null,
		newpar: string | null,
		noSpaceAfter: boolean | null,
	};
	interface Props {
		words: Table<Word>;
	}

	const { words }: Props = $props();

	const blocks = $derived.by(() => {
		const textBlocking = settings.textBlocking;
		const res: Array<{ class: string, words: Word[] }> = [];

		let verse: Word["verse"] = null;
		let sentId: Word["sentId"] = -1;
		let chapter: Word["chapter"] = -1;
		for (let i = 0; i < words.numRows; i++) {
			const w = words.at(i);
			w.index = i;
			if (textBlocking === "paragraph") {
				if (w.newpar) res.push({ class: w.newpar, words: [] });
			} else if (textBlocking === "chapter") {
				if (chapter !== w.chapter) res.push({ class: "chapter", words: [] });
				chapter = w.chapter;
			} else if (textBlocking === "verse") {
				if (verse !== w.verse) res.push({ class: "verse", words: [] });
				verse = w.verse;
			} else if (textBlocking === "sentence") {
				if (sentId !== w.sentId) res.push({ class: "sentence", words: [] });
				sentId = w.sentId;
			}

			if (!res.length) res.push({ class: "", words: [] });
			res[res.length - 1].words.push(w);
		}
		return res;
	});

	// Word
	let lastFocusedWord: HTMLElement | undefined;
	let focusedWord = $state<HTMLElement | undefined>();
	let wordTooltip: HTMLElement;
	let cleanup = () => {};
	onMount(() => cleanup);

	$effect(() => {
		lastFocusedWord?.setAttribute("aria-expanded", "false")
		focusedWord?.setAttribute("aria-expanded", "true");
		lastFocusedWord = focusedWord;
	});

	function onWordClick(ev: MouseEvent | FocusEvent) {
		if (ev.target instanceof HTMLElement && ev.target.hasAttribute("data-index")) {
			const newRef = ev.target as HTMLButtonElement;
			focusedWord = newRef === focusedWord ? undefined : newRef;
			ev.stopImmediatePropagation();
		} else if (!wordTooltip.contains(ev.target as any)) {
			focusedWord = undefined;
		}
	}
	function focusableElements(root: HTMLElement | Document) {
		return root.querySelectorAll('a[href],button,input,textarea,select,details,[tabindex]:not([tabindex="-1"])');
	}
	function onKeyDown(ev: KeyboardEvent) {
		if (ev.key === "Escape") focusedWord = undefined;
		if (ev.key === "Tab") {
			if (!focusedWord) return;
			const focusable = focusableElements(wordTooltip);
			if (!focusable.length) return;

			if ((ev.target as HTMLButtonElement)?.classList.contains("word")) {
				if (ev.shiftKey) {
					focusedWord = undefined;
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
					if (allFocusable[i] === focusedWord) {
						const next = allFocusable[i + 1] || allFocusable[0];
						(next as HTMLElement).focus();
						ev.preventDefault();
						focusedWord = undefined;
						return;
					}
				}
			}
			if (ev.shiftKey && document.activeElement === focusable[0]) {
				focusedWord.focus();
				ev.preventDefault();
				focusedWord = undefined;
				return;
			}
		}
	}

	// Highlights
	let highlightCss = $state<Record<string, string>>({
		red: "background-color: red",
		green: "background-color: green",
	});
	let selectedRange = $state<Range>();

	function getOrAddHighlight(id: string): Highlight {
		const maybeExisting = CSS.highlights.get(id);
		if (maybeExisting) return maybeExisting;
		const res = new Highlight();
		CSS.highlights.set(id, res);
		return res;
	}

	function onSelectionChange() {
		const selection = document.getSelection();
		if (!selection?.rangeCount) {
			selectedRange = undefined;
			return;
		}
		const range = selection.getRangeAt(0);
		if (!range || range.startContainer === range.endContainer && range.startOffset === range.endOffset) {
			selectedRange = undefined;
			return;
		}
		selectedRange = range;
	}
	function annotateRange(range: Range, id: string) {
		const highlight = getOrAddHighlight(id);
		highlight.add(range);
	}
	function annotate(fromIndex: number, toIndex: number, id: string) {
		const fromElement = document.querySelector(`.word[data-index='${fromIndex}']`);
		const toElement = document.querySelector(`.word[data-index='${toIndex}']`);

		if (!fromElement || !toElement) {
			console.warn("cannot find elements in page to annotate", {
				fromIndex,
				fromElement,
				toIndex,
				toElement,
			});
			return;
		}
		console.log("annotate", fromElement, toElement);

		const range = document.createRange();
		range.setStartBefore(fromElement);
		range.setEndAfter(toElement);
		annotateRange(range, id);
	}
	// tick().then(() => {
	// 	annotate(1, 3, "red");
	// });

	// tooltip (word or annotation menu)
	$effect(() => {
		const reference = focusedWord ?? selectedRange;
		const target = wordTooltip;
		if (!reference) return;

		// console.log("click", w);
		// console.log("click", reference.className);
		// console.log("click", reference, target);
		const updatePosition = () => computePosition(reference, target, {
			placement: "bottom",
			middleware: [
				offset(4),
				flip(),
				shift(),
				size({
					apply({ availableWidth, availableHeight, elements }) {
						Object.assign(elements.floating.style, {
							maxWidth: `${Math.max(0, availableWidth)}px`,
							maxHeight: `${Math.max(0, availableHeight)}px`,
						});
					},
				}),
			],
		}).then(({ x, y }) => {
			if (wordTooltip) Object.assign(wordTooltip.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});

		cleanup();
		cleanup = autoUpdate(reference, target, updatePosition);
	});
</script>
<svelte:document
	onkeydown={onKeyDown}
	onclick={onWordClick}
	onselectionchange={onSelectionChange}
/>
<div class="conllu" class:selecting={selectedRange}>
	<svelte:element this={"style"}>
		{Object.entries(highlightCss)
			.map(([k, v]) => `::highlight(${k}){${v}}`)
			.join("")}}}
	</svelte:element>
	{#each blocks as block}
		<p class={block.class} dir="auto">
			{#each block.words as word (word.index)}
				<span
					class="word"
					role="button"
					aria-expanded="false"
					aria-controls="wordTooltip"
					data-index={word.index}
					tabindex="0"
				>
					{word.form}
				</span>{#if !word.noSpaceAfter}{" "}{/if}
			{/each}
		</p>
	{/each}
</div>
<div
	class="tooltip"
	id="wordTooltip"
	bind:this={wordTooltip}
	style:display={focusedWord || selectedRange ? "" : "none"}
	onblur={onWordClick}
>
	{#if selectedRange}
		<button onclick={() => annotateRange(selectedRange!, "red")}>red</button>
		<button onclick={() => annotateRange(selectedRange!, "green")}>green</button>
	{:else}
		<button>something to interact with</button>
		<span>{JSON.stringify(words.at(+(focusedWord?.getAttribute("data-index") ?? 0)), null, 2)}</span>
		<button>something to interact with</button>
	{/if}
</div>
<style>
.word {
	display: inline-block;
	background: none;
	padding: 0;
	margin: 0;
	user-select: text;
}
.selecting .word:focus {
	outline-style: none;
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
