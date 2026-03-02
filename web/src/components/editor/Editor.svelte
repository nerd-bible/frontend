<script lang="ts">
	import { settings } from "../../settings.svelte";
	import type { Table } from "@uwdata/flechette";
	import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
	import { EditorState, Selection, Plugin, TextSelection } from "prosemirror-state";
	import { Node as PmNode } from 'prosemirror-model';
	import { bible } from "./schema";
	import annotationPlugin, { key } from "./annotations";
	import selectionTooltipPlugin from "./tooltip";
	import type { Attachment } from "svelte/attachments";

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
		dir: "ltr" | "rtl";
		id: string;
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
		let nextParaClass = '';
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
			 flushPara("chapter");
				const string = bible.text(w.chapter.toString());
				paragraphs.push(bible.nodes.chapterNum.create({ id: w.chapter.toString() }, string));
				chapter = w.chapter;
			}
			if (verse !== w.verse) {
				if (textBlocking === "verse") flushPara("verse");
				if (w.verse) {
					flushText();
					const string = bible.text(w.verse + " ");
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
				const note = bible.text("hello");
				paragraph.push(bible.nodes.footnote.create({}, note));
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
					selectionTooltipPlugin(tooltipRef),
					annotationPlugin,
					// new Plugin({
					// 	props: {
					// 		decorations(state) {
					// 			return state.selection.empty ? null : DecorationSet.create(
					// 				state.doc,
					// 				[Decoration.inline(state.selection.from, state.selection.to, {class: 'selection'})]
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
	{Object.entries(JSON.parse(settings.userHighlights))
		.map(([k, v]) => `.${k}{${v}}`)
		.join("")}
	{`
	.red.green {
		background-color: purple;
	}
	`}
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
<div class="tooltip" bind:this={tooltipRef}>
	{#each Object.keys(JSON.parse(settings.userHighlights)) as k}
		<button
			onclick={() => {
				view?.dispatch(view.state.tr.setMeta("annotate", k));
			}}
			onmousedown={e => {
				e.preventDefault();
				view?.focus()
			}}
		>
			{k}
		</button>
	{/each}
	<button onclick={() => {
		if (!view) return;

		const decoSet: DecorationSet = key.getState(view.state); 
		const { from, to } = view.state.selection;
		const decos = decoSet.find(from, to);
		console.log(decos);
	}}>
		debug
	</button>
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

	:global(p) {
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
	&[data-chapter-display=float] :global(p) {
		min-height: calc((var(--font-size) + var(--line-height-offset)) * 2);
	}
	&[data-chapter-display=none] :global(h2) {
		display: none;
		width: 100%;
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

	/* Modified prosemirror.css */
	:global(.ProseMirror) {
		word-wrap: break-word;
		white-space: pre-wrap;
		white-space: break-spaces;
		font-variant-ligatures: none;
		font-feature-settings: "liga" 0;
	}
}
.tooltip {
	position: absolute;
	background: var(--color-bg-300);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);

	user-select: none;
	display: flex;
	gap: --spacing(1);
	padding: --spacing(2);

	/* If need to remove overflow-x hidden on body, add these + inner wrapper element: */
	/* https://stackoverflow.com/questions/9933092/css-prevent-absolute-positioned-element-from-overflowing-body */
	/* right: 0; */
	/* overflow: hidden; */
}
/** Footnote */
:global(editor p) {
	counter-reset: footnote;
}
:global(.footnote) {
	cursor: pointer;

	&::after {
		content: counter(footnote, lower-alpha);
		counter-increment: footnote;
	}
}
:global(.selection) {
	background-color: yellow;
}
</style>
