<script lang="ts">
	import { settings } from "../../settings.svelte";
	import type { Table } from "@uwdata/flechette";
	import { EditorView } from "prosemirror-view";
	import "prosemirror-view/style/prosemirror.css";
	import { EditorState, Selection } from "prosemirror-state";
	import { Node as PmNode } from 'prosemirror-model';
	import { bible } from "./schema";
	import pluginAnnotations from "./annotations";
	import pluginTooltip from "./tooltip";

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
					const string = bible.text(w.verse);
					paragraph.push(bible.nodes.verseNum.create({ id: `${chapter}:${w.verse}` }, string));
					text += " ";
				}
				verse = w.verse;
			}
			if (sentId !== w.sentId) {
				if (textBlocking === "sentence") flushPara("sentence");
				sentId = w.sentId;
			}

			text += w.form;
			if (!w.noSpaceAfter) text += " ";
		}
		flushPara("");

		const res = bible.nodes.doc.create(null, paragraphs); 
		return res;
	});

	let highlightCss = $state<Record<string, string>>({
		red: "background-color: rgba(255, 0, 0, 0.5)",
		green: "background-color: rgba(0, 255, 0, 0.5)",
	});

	let editor: HTMLElement;
	$effect(() => {
		const view = new EditorView(editor, {
			state: EditorState.create({
				doc,
				plugins: [
					pluginTooltip,
					pluginAnnotations,
				],
				selection: Selection.atEnd(doc),
			}),
			editable: () => false,
		});
		return () => view.destroy();
	});
</script>
<svelte:element this={"style"}>
	{Object.entries(highlightCss)
		// This $ trick makes the order dependent on the classes in the DOM.
		.map(([k, v]) => `[class$="${k}"]{${v}}`)
		.join("")}}}
</svelte:element>
<div
	class="editor"
	{dir}
	bind:this={editor}
	class:hide-verse-num={settings.showVerseNum !== "true"}
	data-chapter-display={settings.chapterNumDisplay}
></div>
<div>not editor
<button>not editor</button></div>
<style>
.editor {
	/* Offset allows room for verse and inline chapter numbers */
	line-height: calc(var(--font-size) + var(--line-height-offset));

	&.hide-verse-num :global(sup),
	&[data-chapter-display=float] :global(h2 + p > sup:first-child) {
		display: none;
	}

	:global(h2) {
		font-size: 3em;
		text-align: center;
		user-select: none;
	}
	&[data-chapter-display=normal] :global(h2) {
		line-height: normal;
		margin-top: --spacing(3);
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

	:global(.tooltip) {
		position: absolute;
		background: var(--color-bg-300);
		filter: drop-shadow(var(--drop-shadow-xl));
		border-radius: var(--radius-md);
		z-index: 10;

		/* If need to remove overflow-x hidden on body, add these + inner wrapper element: */
		/* https://stackoverflow.com/questions/9933092/css-prevent-absolute-positioned-element-from-overflowing-body */
		/* right: 0; */
		/* overflow: hidden; */

		display: flex;
		gap: --spacing(1);
		padding: --spacing(2);
	}
}
</style>
