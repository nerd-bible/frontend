<script lang="ts">
// TODO: evaluate codemirror
// TODO: loading state
import { Table, tableFromIPC } from "@uwdata/flechette";
import { request } from "../worker.svelte";

let queryString = $state("select * from word limit 10");
let nBytes = $state(0);
let queryResults = $state(new Table({ fields: [] }, [], false));

function onSubmit(ev: SubmitEvent) {
	ev.preventDefault();

	request({ type: "query", data: { query: queryString } }).then(res => {
		nBytes = res.length;
		queryResults = tableFromIPC(res);
	});
}
</script>
<form onsubmit={onSubmit}>
	<textarea placeholder="query" bind:value={queryString}></textarea>
	<input type="submit" />
</form>
<output>
	{queryResults.numRows} rows, {nBytes} bytes
	<table>
		<thead>
			<tr>
				{#each queryResults.names as n}
					<td>{n}</td>
				{/each}
			</tr>
		</thead>
		<tbody>
			<!-- TODO: virtual scroll -->
			{#each { length: Math.min(queryResults.numRows, 100) }, i}
				<tr>
					{#each queryResults.names as n}
						<td>{queryResults.at(i)[n]}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</output>
<style>
textarea {
	width: 100%;
	height: 200px;
}
table {
	width: 100%;
}
</style>
