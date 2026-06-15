<script lang="ts">
import { settings } from "../../settings.svelte";
import sample from "../../genesis.html?raw";
import Tabs from "../Tabs.svelte";
import Outline from "./Outline.svelte";
import Layers from "./Layers.svelte";
import View from "./View.svelte";
import { computePosition, offset, flip, inline, shift } from "@floating-ui/dom";
import { t } from "../../l10n.svelte";
import Layout from "./Layout.svelte";
import "./content.css";
// import { docFromBookLang } from "./tree.svelte.ts";

// https://github.com/aleventhal/aria-annotations/blob/master/README.md#simplified-aria-annotations-proposal--explainer
// interface Props {
// 	book: string;
// }
// const { book }: Props = $props();
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
{#snippet col1()}
	<Tabs
		items={[
			{ label: t("Outline"), component: Outline },
			{ label: t("View"), component: View },
			{ label: t("Layers"), component: Layers },
		]}
	/>
{/snippet}
{#snippet col2()}
	<div
		class="editor"
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
{/snippet}
{#snippet col3()}
	<div role="note" class="notes">
		<a class="footnote" id="pnote1">
			Literally <i>day one</i>
		</a>
		<a class="footnote" id="pnote2">
			Or a canopy or a firmament or a vault and the rest of this is a long
			sentence to test line wrapping because width is finite
		</a>
	</div>
{/snippet}
<Layout
	--line-height={settings.lineHeight}
	--font-size={settings.fontSize + "px"}
	{col1}
	{col2}
	{col3}
></Layout>

<div
	class="tooltip"
	bind:this={tooltipRef}
	style:top={tooltipPos.top + "px"}
	style:left={tooltipPos.left + "px"}
></div>

<style>
.tooltip {
	display: flex;
	position: absolute;
	background: var(--color-bg-300);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);

	gap: --spacing(1);
	padding: --spacing(2);
	width: max-content;
	max-width: calc(100vw - var(--layout-padding-x) * 2);
	/* above other editor content but below header */
	z-index: 2;
}

.editor :global(mark),
.notes > * {
	&:global(.focus) {
		animation: focus 1s ease forwards;
	}
	text-decoration-color: var(--color-fg-500);
	text-decoration-line: underline;
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
