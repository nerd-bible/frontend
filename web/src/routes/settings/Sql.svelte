<script lang="ts">
import DbGuard from "../../components/DbGuard.svelte";
import Schema from "../../components/sql/Schema.svelte";
import Editor from "../../components/sql/Editor.svelte";
import Table from "../../components/sql/Table.svelte";
import type { db } from "../../workers/dispatcher.svelte";

let input = $state("SELECT * FROM scripture");
let output = $state<ReturnType<typeof db.run>>(new Promise((res) => res([])));
</script>

<DbGuard>
	<div class="vert">
		<div><Schema /></div>
		<Editor
			bind:value={input}
			onResults={(res: ReturnType<typeof db.run>) => (output = res)}
			{output}
		/>
	</div>
	{#await output then value}
		<output>
			<Table rows={value} />
		</output>
	{:catch error}
		<p>{error.message}</p>
	{/await}
</DbGuard>

<style>
output {
	display: block;
}
.vert {
	> div {
		width: 200px;
	}
	display: flex;
	gap: --spacing(4);
	margin-bottom: --spacing(4);
}
</style>
