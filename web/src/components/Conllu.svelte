<script lang="ts">
	import { computePosition, flip, offset, shift, size, autoUpdate } from '@floating-ui/dom';
	import { onMount } from "svelte";
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

	// Render sentences. I would LOVE to use svelte templating syntax, but it has
	// bad behavior:
	// - Puts paragraphs into a fragment and appends it, which lags the browser.
	// - Adds a needless comment node per paragraph and word.
	// - Templating using `selected` is slow on update (~50ms) due to effect tree.
	// const wordTemplate = document.createElement("button");
	// wordTemplate.className = "word";
	// wordTemplate.setAttribute("aria-expanded", "false");
	// wordTemplate.setAttribute("aria-controls", "wordTooltip");
	//
	// function createWord(form: string, index: number) {
	// 	const res = wordTemplate.cloneNode() as HTMLButtonElement;
	// 	res.appendChild(document.createTextNode(form));
	// 	(res as any).wordIndex = index;
	// 	return res;
	// }
	//
	// function createParagraph(className: string) {
	// 	const res = document.createElement("p");
	// 	res.dir = "auto";
	// 	res.className = className;
	// 	return res;
	// }
	//
	// let p = createParagraph("");
	// let wordI = 0;
	// function renderWords(element: Element, n: number) {
	// 	const words = [];
	// 	// const subtable = table.select(['delay', 'time']);
	// 	const ids = words.getChild("id");
	// 	const forms = words.getChild("form");
	// 	const miscs = words.getChild("misc");
	// 	const length = Math.min(wordI + n, words.numRows);
	// 	for (; wordI < length; wordI++) {
	// 		const word = createWord(forms.at(wordI), wordI);
	// 		p.appendChild(word);
	//
	// 		const misc = Object.fromEntries(miscs.at(wordI)); 
	// 		if (misc["newpar"]) {
	// 			element.appendChild(p);
	// 			p = createParagraph(misc["newpar"]);
	// 		}
	// 		if (misc["SpaceAfter"] !== "No") {
	// 			p.appendChild(document.createTextNode(" "));
	// 		}
	//
	// 		// Skip multiword subwords
	// 		const wid = ids.at(wordI) as number;
	// 		if (wid < 0) wordI += -wid;
	// 	}
	// 	// Append last p. If already appended from an earlier run that's OK as long
	// 	// as it's still last.
	// 	element.appendChild(p);
	// }

	// Popover
	let selectedRef = $state<HTMLElement | undefined>();
	let tooltipRef: HTMLElement;
	let cleanup = () => {};
	onMount(() => cleanup);

	$effect(() => {
		const reference = selectedRef;
		const target = tooltipRef;
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
			if (tooltipRef) Object.assign(tooltipRef.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});

		cleanup();
		cleanup = autoUpdate(reference, target, updatePosition);
	});

	function onWordClick(ev: MouseEvent | FocusEvent) {
		if (ev.target instanceof HTMLElement && ev.target.hasAttribute("data-index")) {
			const newRef = ev.target as HTMLButtonElement;
			selectedRef = newRef === selectedRef ? undefined : newRef;
			ev.stopImmediatePropagation();
		} else if (!tooltipRef.contains(ev.target as any)) {
			selectedRef = undefined;
		}
	}
	function focusableElements(root: HTMLElement | Document) {
		return root.querySelectorAll('a[href],button,input,textarea,select,details,[tabindex]:not([tabindex="-1"])');
	}
	function onKeyDown(ev: KeyboardEvent) {
		if (ev.key === "Escape") selectedRef = undefined;
		if (ev.key === "Tab") {
			if (!selectedRef) return;
			const focusable = focusableElements(tooltipRef);
			if (!focusable.length) return;

			if ((ev.target as HTMLButtonElement)?.classList.contains("word")) {
				if (ev.shiftKey) {
					selectedRef = undefined;
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
						selectedRef = undefined;
						return;
					}
				}
			}
			if (ev.shiftKey && document.activeElement === focusable[0]) {
				selectedRef.focus();
				ev.preventDefault();
				selectedRef = undefined;
				return;
			}
		}
	}
</script>
<svelte:document onkeydown={onKeyDown} onclick={onWordClick} />
<div class="conllu">
	{#each blocks as block}
		<p class={block.class} dir="auto">
			{#each block.words as word (word.index)}
				<button
					class="word"
					aria-expanded="false"
					aria-controls="wordTooltip"
					data-index={word.index}
				>
					{word.form}
				</button>{#if !word.noSpaceAfter}{" "}{/if}
			{/each}
		</p>
	{/each}
</div>
<div
	class="tooltip"
	id="wordTooltip"
	bind:this={tooltipRef}
	style:display={selectedRef ? "" : "none"}
	onblur={onWordClick}
>
	<button>something to interact with</button>
	<span>{JSON.stringify(words.at(+(selectedRef?.getAttribute("data-index") ?? 0)), null, 2)}</span>
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
