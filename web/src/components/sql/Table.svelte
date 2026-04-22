<script lang="ts">
let { rows = [] } = $props();

const cols = $derived(Object.keys(rows[0] ?? []));

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
			if (ArrayBuffer.isView(v)) return `BLOB (${v.byteLength})`;
			return "????";
	}
}
</script>

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
		{#each { length: rows.length }, i}
			<tr>
				{#each cols as n}
					<td>{toString(rows[i]![n])}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style>
table {
	width: 100%;
}
</style>
