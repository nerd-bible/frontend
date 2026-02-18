<script lang="ts">
import Loading from "../components/Loading.svelte";
import Editor from "../components/editor/Editor.svelte";
import { settings } from "../settings.svelte";
import { firstIngestRequest, query } from "../worker.svelte";
import { tableFromArrays } from '@uwdata/flechette';

const arrays = {
	sentId: [1, 1, 1, 2, 2, 3, 4],
	id: [0, 1, 2, 3, 4, 5, 6],
	form: ["In", "the", "beginning", "God", "created", "Now", "the"],
	chapter: [1, 1, 1, 1, 1, 2, 2],
	verse: ["1", "1", "1", "2", "2", "1", "1"],
	newpar: ['normal', null, null, null, null, 'normal', null],
	noSpaceAfter: [null, null, null, null, true, null, null],
};
let dir = $state<"ltr" | "rtl">("ltr");
let id = $state("gen");
let words = $state(tableFromArrays(arrays));
firstIngestRequest.then(
	() => query(`select
		sentId,
		word.id as id,
		form,
		chapter,
		verse,
		misc['newpar'] as newpar,
		misc['SpaceAfter'] = 'No' as noSpaceAfter
	from word
	join sentence on sentence.id = sentId
	where word.docId='${id}' and form is not null and isElision is null and morphemeOf is null
	order by sentence.position, word.position
	`).then(r => {
			words = r;
			dir = "rtl";
		})
);
</script>
<main
	style:width={`${settings.columnWidth}px`}
	style:--font-size={`${settings.fontSize}px`}
	style:--line-height-offset={settings.lineHeightOffset}
>
	{#if words}
		<Editor {id} {dir} {words} />
	{:else}
		<Loading />
	{/if}
</main>
<style>
main {
	padding: --spacing(4) 0;
	max-width: 100%;
	margin: 0 auto;
	font-size: var(--font-size);
}
</style>
