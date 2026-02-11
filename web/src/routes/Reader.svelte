<script lang="ts">
import Loading from "../components/Loading.svelte";
import Conllu from "../components/Conllu.svelte";
import { settings } from "../settings.svelte";
import { firstIngestRequest, query } from "../worker.svelte";

let words = $state.raw();

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
	where word.docId='gen' and form is not null and type not in ('subword', 'ellision')
	order by sentence.position, word.position
	`).then(r => words = r)
);
</script>

<main
	style:max-width={`${settings.columnWidth}px`}
	style:font-size={`${settings.fontSize}px`}
>
	{#if words}
		<Conllu {words} />
	{:else}
		<Loading width={`${settings.columnWidth}px`} />
	{/if}
</main>
<style>
main {
	padding: --spacing(4) 0;
	margin: auto;
}
</style>
