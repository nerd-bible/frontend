<script lang="ts">
	import Dir from "./Dir.svelte";
	let { dir }: { dir?: FileSystemDirectoryHandle } = $props();

	$inspect(dir);

	type Dir = FileSystemFileHandle | FileSystemDirectoryHandle;
	let entries = $state<Dir[]>([]);

	async function walk(dir: FileSystemDirectoryHandle) {
		const res: (Dir)[] = [];
		for await (const [key, value] of dir.entries()) {
			res.push(value);
		}

		console.log("uhhh", res);
		return res;
	}

	$effect(() => {
		if (dir) entries = walk(dir);
	});
</script>
{#await entries then e}
	<ul>
		{#each e as f}
			<li>
				{f.name}
				{#if f.kind === "file"}
					{#await f.getFile() then f2}
						({f2.size} bytes)
					{/await}
				{/if}
				<button onclick={() => {
					f.remove({ recursive: true });
				}}>
					delete
				</button>
				{#if f.kind === "directory"}
					<Dir dir={f} />
				{:else}
					<button onclick={async () => {
						const opened = await f.getFile();
						const fileContent = await opened.arrayBuffer();
						const blob = new Blob([fileContent], { type: 'application/x-sqlite3' });
						const link = document.createElement('a');
						link.href = URL.createObjectURL(blob);
						link.download = f.name;
						link.click();
						URL.revokeObjectURL(link.href);
					}}>download</button>
				{/if}
			</li>
		{/each}
	</ul>
{/await}
<style>
:global(ul ul) {
	padding-inline-start: --spacing(4);
}
</style>
