<script lang="ts">
// TODO: codemirror
import { db } from "../workers/dispatcher.svelte";

let input = $state("select * from sqlite_master");
let outputPromise = $state<ReturnType<typeof db.run>>(new Promise((res) => res([])));
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

	outputPromise = db.run(input).then(res => {
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
<form onsubmit={onSubmit}>
	<textarea name="query" placeholder="SELECT ..." bind:value={input}></textarea>
	<div class="submit">
		<input type="submit" />
{#await outputPromise}
	{#if elapsed > 1000}
		<p>{(elapsed / 1000).toFixed(1)}s</p>
	{/if}
{:then value}
	{value.length} rows
{/await}
	</div>
</form>
{#await outputPromise then value}
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
	margin-bottom: --spacing(4);
}
output {
	display: block;
}
</style>
<l10n lang="en-US">
reference = Reference manual
</l10n>
<l10n lang="es">
reference = Manual de referencia
</l10n>
