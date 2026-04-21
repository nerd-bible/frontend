<script lang="ts">
import { db } from "../../workers/dispatcher.svelte.ts";

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
</script>

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
<style>
	/* https://developer.chrome.com/blog/styling-details */
	details > pre {
		overflow-x: auto;
	}
</style>
