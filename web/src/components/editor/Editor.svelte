<script lang="ts">
	import { settings } from "../../settings.svelte";
	import type { Table } from "@uwdata/flechette";
	import { EditorView } from "prosemirror-view";
	import { EditorState, TextSelection } from "prosemirror-state";
	import { Node as PmNode } from 'prosemirror-model';
	import { bible } from "./schema";
	import * as plugins from "./plugins";
	import "./prosemirror.css";
	import "./schema.css";

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
		id: string;
		dir: "ltr" | "rtl";
	}

	const { words, dir }: Props = $props();

	const doc = $derived.by(() => {
		const textBlocking = settings.textBlocking;
		const paragraphs: PmNode[] = [];
		let paragraph: PmNode[] = [];

		let text = '';
		function flushText() {
			if (!text.length) return;
			paragraph.push(bible.text(text));
			text = '';
		}
		let nextParaClass = words.at(0)?.newpar ?? '';
		function flushPara(nextClass: string) {
			flushText();
			if (!paragraph.length) return;

			const para = bible.nodes.paragraph.create({ class: nextParaClass }, paragraph);
			paragraphs.push(para);
			paragraph = [];
			nextParaClass = nextClass;
		}

		let sentId: Word["sentId"] = -1;
		let chapter: Word["chapter"] = null;
		let verse: Word["verse"] = null;

		for (let i = 0; i < words.numRows; i++) {
			const w = words.at(i);
			w.index = i;

			if (textBlocking === "paragraph" && w.newpar) {
				flushPara(w.newpar);
			}
			if (chapter !== w.chapter && w.chapter) {
				if (textBlocking === "chapter") flushPara("chapter");
				const string = bible.text(w.chapter.toString());
				paragraphs.push(bible.nodes.chapterNum.create({ id: w.chapter.toString() }, string));
				chapter = w.chapter;
			}
			if (verse !== w.verse) {
				if (textBlocking === "verse") flushPara("verse");
				if (w.verse) {
					flushText();
					const string = bible.text(w.verse);
					paragraph.push(bible.nodes.verseNum.create({ id: `${chapter}:${w.verse}` }, string));
				}
				verse = w.verse;
			}
			if (sentId !== w.sentId) {
				if (textBlocking === "sentence") flushPara("sentence");
				sentId = w.sentId;
			}
			if (i && i % 100 == 0) {
				flushText();
				const note = bible.nodes.paragraph.create(null, bible.text("hello there the angel from my nightmare it's funny how i meet you here tonight i love pie and filling that's cherry it's so yummy in ym tummy"));
				paragraph.push(bible.nodes.footnote.create(null, note));
			}

			text += w.form;
			if (!w.noSpaceAfter) text += " ";
		}
		flushPara("");

		return bible.nodes.doc.create(null, paragraphs); 
	});

	let tooltipRef: HTMLElement;
	let editorRef: HTMLElement;
	let view: EditorView;
	let editable = $state(false);

	$effect(() => {
		if (!tooltipRef || !editorRef) return;

		view = new EditorView(editorRef, {
			state: EditorState.create({
				schema: bible,
				plugins: [
					// There are ways to use Svelte in plugins via
					// `@prosemirror-adapter/svelte`. I gave up after a day because 
					// overriding methods like `update` and `stopEvent` that need
					// component state is too difficult. The reactive model of svelte
					// is mostly incompatible with the stateful class model of
					// prosemirror-view.
					// As a bonus the editor isn't dependent on Svelte and is sharable
					// with others.
					plugins.annotation,
					plugins.footnote,
					plugins.bubbleMenu(tooltipRef),
				],
			}),
			editable: () => editable,
		});

		return () => view.destroy();
	});

	$effect(() => {
		if (!view) return;

		const newState = EditorState.create({ doc, plugins: view.state.plugins });
    view.updateState(newState);
				// selection: TextSelection.between(doc.resolve(0), doc.resolve(0)),
	});

	$effect(() => {
		if (!view) return;
		void doc;

		const addClasses = view.state.tr.setMeta("annotationClasses", $state.snapshot(settings.userHighlights));
		view.dispatch(addClasses);
	});

</script>
<label>
	editable
	<input type="checkbox" bind:checked={editable}>
</label>
<div
	class="nb-bible"
	{dir}
	bind:this={editorRef}
	class:hide-verse-num={settings.showVerseNum !== "true"}
	class:hide-footnotes={settings.showFootnotes !== "true"}
	data-chapter-display={settings.chapterNumDisplay}
>
</div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="tooltip" bind:this={tooltipRef} onmousedown={ev => ev.preventDefault()}>
	{#each Object.keys(settings.userHighlights) as k}
		<button
			onclick={() => {
				if (!view) return;

				const { from, to } = view.state.selection;
				view?.dispatch(view.state.tr.setMeta("annotate", { from, to, class: k }));
				document.getSelection()?.removeAllRanges();

				// const decoSet: DecorationSet = key.getState(view.state); 
				// const decos = decoSet.find(from, to);
				// console.log(decos);
			}}
		>
			{k}
		</button>
	{/each}
	<button
		onclick={() => {
			settings.userHighlights["pink"] = { "background-color": "rgb(255,192,203)" };
		}}
	>add</button>
</div>
