<script lang="ts">
import Loading from "../components/Loading.svelte";
import Editor from "../components/editor/Editor.svelte";
import { settings } from "../settings.svelte";
import { firstIngestRequest, query } from "../worker.svelte";

let words = $state();
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
	where word.docId='gen' and form is not null and isElision is null and morphemeOf is null
	order by sentence.position, word.position
	`).then(r => words = r)
);
</script>
<div>
	<main
		style:width={`${settings.columnWidth}px`}
		style:--font-size={`${settings.fontSize}px`}
		style:--line-height-offset={settings.lineHeightOffset}
	>
		{#if words}
			<Editor docId="Genesis" {words} />
		{:else}
			<Loading />
		{/if}
	</main>
</div>
<style>
main {
	padding: --spacing(4) 0;
	max-width: 100%;
	margin: 0 auto;
	font-size: var(--font-size);
}
</style>
