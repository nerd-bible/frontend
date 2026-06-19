<script lang="ts">
import { settings } from "../../settings.svelte";
import sample from "../../genesis.html?raw";
import Tabs from "../Tabs.svelte";
import Outline from "./Outline.svelte";
import Layers from "./Layers.svelte";
import View from "./View.svelte";
import { computePosition, offset, flip, inline, shift } from "@floating-ui/dom";
import { t } from "../../l10n.svelte";
import ThreeCol from "../../layouts/ThreeCol.svelte";
import "./content.css";
// import { docFromBookLang } from "./tree.svelte.ts";

// https://github.com/aleventhal/aria-annotations/blob/master/README.md#simplified-aria-annotations-proposal--explainer
// interface Props {
// 	// book: string;
// 	main: boolean;
// }
// const { main = false }: Props = $props();
let dir = $state<"ltr" | "rtl">("ltr");
let tooltipRef: HTMLDivElement;
let tooltipPos = $state({ left: 0, top: -100 });
let selectedNote = $state<HTMLElement>();
// let doc = $derived(docFromBookLang(book, settings.locale));

function layoutTooltip() {
	const reference = selectedNote;
	if (!reference) return;
	const computed = getComputedStyle(document.body);
	const remToPx = (rem: string) =>
		parseFloat(rem) * parseFloat(computed.fontSize);
	const spacing = remToPx(computed.getPropertyValue("--spacing-inc"));

	const middleware = [
		offset(spacing * 1), // from `placement`
		flip(), // to opposite of `placement` if cannot fit
		inline({ padding: 0 }),
		shift({ padding: spacing * 4 }),
	];

	computePosition(reference, tooltipRef, {
		placement: "top",
		middleware,
	}).then(({ x, y }) => {
		tooltipPos.left = x;
		tooltipPos.top = y;
	});
}

function highlight(ele: HTMLElement) {
	ele.classList.add("focus");
	const animations = ele.getAnimations();
	animations.forEach((anim) => {
		anim.cancel();
		anim.play();
	});
}

function highlightNote(ele: HTMLElement) {
	const referencedBy = document.querySelectorAll(`[aria-details=${ele.id}]`);
	for (let i = 0; i < referencedBy.length; i++)
		highlight(referencedBy[i] as HTMLElement);
}

function layoutNotes(div: HTMLElement) {
	const parentRect = div.getBoundingClientRect();
	const sameLineNoteStyles = ["wavy", "dashed", "dotted", "none"];
	let lastY = 0;
	let lastHeight = 0;
	let overlapping = 0;
	div.querySelectorAll("mark").forEach((mark) => {
		const fromRects = mark.getClientRects();
		const rect = fromRects[fromRects.length - 1];
		const y = Math.max(lastY + lastHeight, rect.top - parentRect.top);
		const note = mark.ariaDetailsElements![0] as HTMLElement;
		if (!note) return;

		let style = "solid";
		if (y === lastY + lastHeight)
			style = sameLineNoteStyles[overlapping++ % sameLineNoteStyles.length];
		else overlapping = 0;
		mark.style.textDecorationStyle = style;
		note.style.textDecorationStyle = style;
		note.style.top = y + "px";
		note.style.position = "absolute";

		lastY = y;
		lastHeight = note.clientHeight;
	});
}
</script>

<svelte:document
	onclick={(ev) => {
		const mark = ev.target as HTMLElement;
		if (mark.tagName === "MARK") {
			const note = mark.ariaDetailsElements![0] as HTMLElement;
			if (note.checkVisibility()) {
				highlight(note);
			} else {
				const cloned = note.cloneNode(true) as HTMLElement;
				cloned.removeAttribute("id");
				cloned.style = "";
				tooltipRef.replaceChildren(cloned);
				selectedNote = mark;
				layoutTooltip();
			}
		} else if (!tooltipRef.contains(ev.target as HTMLElement)) {
			selectedNote = undefined;
			tooltipPos.top = -100;
		}

		if (mark.classList.contains("footnote")) {
			highlightNote(mark);
		}
	}}
/>
<svelte:window
	onresize={() => {
		selectedNote = undefined;
		tooltipPos.top = -100;
	}}
/>

<ThreeCol layout={layoutNotes}>
	{#snippet left()}
		<Tabs
			items={[
				{ label: t("Outline"), component: Outline },
				{ label: t("View"), component: View },
				{ label: t("Layers"), component: Layers },
			]}
		/>
	{/snippet}
	<div
		class="content"
		{dir}
		class:hide-verse={!settings.showVerseNum}
		class:hide-chapter={!settings.showChapterNum}
		class:hide-outline={!settings.showOutline}
		class:drop-caps={settings.showDropCaps}
		class:justify-text={settings.justifyText}
	>
		<h1>Genesis</h1>
		{@html sample}
	</div>
	<div
		role="tooltip"
		bind:this={tooltipRef}
		style:top={tooltipPos.top + "px"}
		style:left={tooltipPos.left + "px"}
	></div>

	{#snippet right()}
		<div class="notes">
			<a class="footnote" id="pnote1">
				Literally <i>day one</i>
			</a>
			<a class="footnote" id="pnote2">
				Or a canopy or a firmament or a vault and the rest of this is a long
				sentence to test line wrapping because width is finite
			</a>
		</div>
	{/snippet}
</ThreeCol>

<style>
.content :global(mark),
.notes > * {
	&:global(.focus) {
		animation: focus 1s ease forwards;
	}
	text-decoration-color: var(--color-fg-500);
	text-decoration-line: underline;
}

.notes {
	position: relative;
	a {
		color: var(--color-fg-200);
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
</style>
