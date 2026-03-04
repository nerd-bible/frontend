<script lang="ts">
	import { settings } from "../../settings.svelte";
	import type { Table } from "@uwdata/flechette";
	import { DecorationSet, EditorView } from "prosemirror-view";
	import { EditorState, TextSelection } from "prosemirror-state";
	import { Node as PmNode } from 'prosemirror-model';
	import { bible } from "./schema";
	import annotationPlugin, { key } from "./annotations";
	import selectionTooltipPlugin from "./tooltip";
	import footnotePlugin from "./footnote";
	import { gapCursor } from "prosemirror-gapcursor";
	import "prosemirror-view/style/prosemirror.css";
	import "prosemirror-gapcursor/style/gapcursor.css";
	import { toggleMark } from "prosemirror-commands";

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

		const res = bible.nodes.doc.create(null, paragraphs); 
		return res;
	});

	let tooltipRef: HTMLElement;
	let editorRef: HTMLElement;
	let view: EditorView;
	$effect(() => {
		if (!tooltipRef || !editorRef) return;

		view = new EditorView(editorRef, {
			state: EditorState.create({
				doc,
				plugins: [
					// There are ways to use Svelte in plugins via
					// `@prosemirror-adapter/svelte`. I gave up after a day because 
					// overriding methods like `update` and `stopEvent` that need
					// component state is too difficult. The reactive model of svelte
					// is mostly incompatible with the stateful class model of
					// prosemirror-view.
					// As a bonus the editor isn't dependent on Svelte and is sharable
					// with others.
					annotationPlugin,
					footnotePlugin,
					selectionTooltipPlugin(tooltipRef),
					// gapCursor(),
					// new Plugin({
					// 	props: {
					// 		decorations(state) {
					// 			return state.selection.empty ? null : DecorationSet.create(
					// 				state.doc,
					// 				[Decoration.inline(state.selection.from, state.selection.to, {style: 'background:yellow'})]
					// 			)
					// 		}
					// 	}
					// })
				],
				selection: TextSelection.between(doc.resolve(0), doc.resolve(0)),
			}),
			editable: () => false,
		});
		return () => view.destroy();
	});
</script>
<svelte:element this={"style"}>
	{#each Object.entries(JSON.parse(settings.userHighlights)) as [k, v]}
		{`.${k}{${v}}`}
	{/each}
</svelte:element>
<div>
	not editor
	<button>not editor</button>
</div>
<div
	class="editor"
	{dir}
	bind:this={editorRef}
	class:hide-verse-num={settings.showVerseNum !== "true"}
	class:hide-footnotes={settings.showFootnotes !== "true"}
	data-chapter-display={settings.chapterNumDisplay}
>
</div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="tooltip" bind:this={tooltipRef} onmousedown={ev => ev.preventDefault()}>
	{#each ["red", "green", "blue"] as k}
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
</div>
<div>
	not editor
	<button>not editor</button>
</div>
<style>
.editor {
	/* Offset allows room for verse and inline chapter numbers */
	line-height: calc(var(--font-size) + var(--line-height-offset));

	&.hide-verse-num :global(.verseNum),
	&.hide-footnotes :global(.footnote),
	&[data-chapter-display=float] :global(h2 + p > sup:first-child) {
		display: none;
	}

	:global(p:not(:last-child)) {
		margin-bottom: --spacing(4);
	}

	:global(h2) {
		font-size: 3em;
		text-align: center;
		user-select: none;
	}
	&[data-chapter-display=normal] :global(h2) {
		line-height: normal;
		margin-bottom: --spacing(1);

		&:first-child {
			margin-top: 0;
		}
	}
	&[data-chapter-display=float] :global(h2) {
		/* TODO: make work in older browsers */
		float: inline-start;
		margin-inline-start: --spacing(-1);
		margin-inline-end: --spacing(5);
		/* eyeballed to be about two lines tall for inline */
		/* must keep in sync with font-size */
		padding-top: calc((var(--font-size) + var(--line-height-offset)) / 2);
	}
	&[data-chapter-display=float] :global(h2 + p) {
		/* make space for chapter number */
		min-height: calc((var(--font-size) + var(--line-height-offset)) * 2);
	}
	&[data-chapter-display=none] :global(h2) {
		display: none;
	}
	&[data-chapter-display=small] :global(h2) {
		opacity: 0.5;
		font-size: 0.5em;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: --spacing(4);

		&::before, &::after {
			content: "";
			flex-grow: 1;
			/* width: --spacing(12); */
			border-bottom: 1px solid;
		}
	}

	:global(a) {
		text-decoration: none;
	}

	:global(p) {
		/* follow dir instead of being all smart */
		unicode-bidi: bidi-override;
	}

	:global(.verseNum) {
		opacity: 0.75;
		padding-inline-end: --spacing(1);
	}
}
</style>
