<script lang="ts">
import { db } from "../workers/dispatcher.svelte";

let input = $state("SELECT * FROM scripture");
let schema = db.run("SELECT type, name, tbl_name, sql FROM sqlite_master").then(res => res.reduce((acc, cur) => {
	acc[cur.tbl_name] ??= { create: "", indices: [], triggers: [] };
	switch (cur.type) {
		case "table":
			acc[cur.tbl_name].create = cur.sql;
			break;
		case "index":
			acc[cur.tbl_name].indices.push(cur.sql);
			break;
		case "trigger":
			acc[cur.tbl_name].triggers.push(cur.sql);
			break;
	}
	return acc;
}, {} as Record<string, { create: string, indices: string[], triggers: string[] }>));
let output = $state<ReturnType<typeof db.run>>(new Promise((res) => res([])));
let elapsed = $state(0);

function onSubmit(ev: SubmitEvent) {
	ev.preventDefault();
	elapsed = 0;
	let last_time = performance.now();
	let frame = requestAnimationFrame(function update(time) {
		frame = requestAnimationFrame(update);

		elapsed += time - last_time;
		last_time = time;
	});

	output = db.run(input).then(res => {
		cancelAnimationFrame(frame);
		return res;
	});
}
function toString(v: any) {
	switch (typeof v) {
		case "string":
		case "boolean":
		case "number":
		case "bigint":
			return v.toString();
		case "undefined":
			return "UNDF";
		case "object": 
			if (v === null) return "NULL";
		case "symbol":
		case "function":
			return "????";
	}
}
</script>
<div class="vert">
	<div>
		{#await schema then value}
			{#each Object.entries(value) as [tname, dets]}
				<details>
					<summary>{tname}</summary>
					<pre>{dets.create}</pre>
					<!-- <ul> -->
					<!-- 	{#each dets.indices as i} -->
					<!-- 		<li><pre>{i}</pre></li> -->
					<!-- 	{/each} -->
					<!-- </ul> -->
					<!-- <ul> -->
					<!-- 	{#each dets.triggers as t} -->
					<!-- 		<li><pre>{t}</pre></li> -->
					<!-- 	{/each} -->
					<!-- </ul> -->
				</details>
			{:else}
				no tables
			{/each}
		{/await}
	</div>
	<form onsubmit={onSubmit}>
		<textarea name="query" placeholder="SELECT ..." bind:value={input}></textarea>
		<div class="submit">
			<input type="submit" />
	{#await output}
		{#if elapsed > 1000}
			<p>{(elapsed / 1000).toFixed(1)}s</p>
		{/if}
	{:then value}
		{value.length} rows
	{/await}
		</div>
	</form>
</div>
{#await output then value}
{@const cols = Object.keys(value[0] ?? [])}
<output>
	<table>
		<thead>
			<tr>
				{#each cols as n}
					<td>{n}</td>
				{/each}
			</tr>
		</thead>
		<tbody>
			<!-- TODO: virtual scroll -->
			{#each { length: value.length }, i}
				<tr>
					{#each cols as n}
						<td>{toString(value[i]![n])}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</output>
{:catch error}
	<p>{error.message}</p>
{/await}
<style>
textarea {
	width: 100%;
	height: 200px;
}
table {
	width: 100%;
}
.submit {
	display: flex;
	justify-content: space-between;
}
output {
	display: block;
}
.vert {
	> div {
		width: 200px;

		/* https://developer.chrome.com/blog/styling-details */
		details > pre {
			overflow-x: auto;
		}
	}
	display: flex;
	gap: --spacing(4);
	margin-bottom: --spacing(4);

	> form {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		> textarea {
			flex-grow: 1;
		}
	}
}
</style>
<l10n lang="en-US">
reference = Reference manual
</l10n>
<l10n lang="es">
reference = Manual de referencia
</l10n>
