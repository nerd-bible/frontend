<script lang="ts">
import { settings } from "../../settings.svelte";
import "./schema.css";

type Word = {
	index: number;
	sentId: number;
	id: number;
	form: string;
	chapter: number | null;
	verse: string | null;
	newpar: string | null;
	noSpaceAfter: boolean | null;
};
interface Props {
	id: string;
	dir: "ltr" | "rtl";
}

const { dir }: Props = $props();

const doc = $derived.by(() => {
	return prosemirror.sample as PmNode;
});

let tooltipRef: HTMLElement;
let editorRef: HTMLElement;
let view: EditorView;
let editable = $state(false);

$effect(() => {
	if (!tooltipRef || !editorRef) return;

	view = new EditorView(editorRef, {
		state: EditorState.create({
			schema: doc.type.schema,
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

	doc.check();
	console.time("render");
	const newState = EditorState.create({ doc, plugins: view.state.plugins });
	view.updateState(newState);

	requestAnimationFrame(() => console.timeEnd("render"));
	// selection: TextSelection.between(doc.resolve(0), doc.resolve(0)),
});

$effect(() => {
	if (!view) return;
	void doc;

	const addClasses = view.state.tr.setMeta(
		"annotationClasses",
		$state.snapshot(settings.userHighlights),
	);
	view.dispatch(addClasses);
});
</script>

<label>
	editable
	<input type="checkbox" bind:checked={editable} />
</label>
<div
	class="nb-bible"
	{dir}
	bind:this={editorRef}
	class:hide-verse-num={settings.showVerseNum !== "true"}
	class:hide-footnotes={settings.showFootnotes !== "true"}
	data-chapter-display={settings.chapterNumDisplay}
></div>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="tooltip"
	bind:this={tooltipRef}
	onmousedown={(ev) => ev.preventDefault()}
>
	{#each Object.keys(settings.userHighlights) as k}
		<button
			onclick={() => {
				if (!view) return;

				const { from, to } = view.state.selection;
				view?.dispatch(
					view.state.tr.setMeta("annotate", { from, to, class: k }),
				);
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
			settings.userHighlights["pink"] = {
				"background-color": "rgb(255,192,203)",
			};
		}}>add</button
	>
</div>
