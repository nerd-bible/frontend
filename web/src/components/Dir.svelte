<script lang="ts">
import Dir from "./Dir.svelte";
import Delete from "virtual:icons/lucide/trash";
import Download from "virtual:icons/lucide/download";
import Upload from "virtual:icons/lucide/upload";
import { t } from "../l10n.svelte.ts";
import type { DirentData } from "opfs-worker/pure";
import api from "../workers/init.ts";

const { fs } = api;
type Props = { path?: string; };
let { path = "" }: Props = $props();

let entries = $state<DirentData[]>([]);

$effect(() => {
	fs.watch(path, { recursive: false }, ev => {
		console.log(ev);
	});

	fs.readDir(path).then(res => (entries = res));
});

let sorted = $derived(entries.toSorted((a, b) => a.name.localeCompare(b.name)));
</script>

<ul>
	{#each sorted as f}
		<li>
			{f.name}
			{#if f.kind === "file"}
				f
			{/if}
			<button
				onclick={async () => {
					await fs.remove([path, f.name].join("/"), { recursive: true });
					reread();
				}}
			>
				<Delete aria-label={t("Delete")} />
			</button>
			{#if f.kind === "directory"}
				<Dir path={[path, f.name].join("/")} />
			{:else}
				<!-- <button -->
				<!-- 	onclick={async () => { -->
				<!-- 		const opened = await f.getFile(); -->
				<!-- 		const fileContent = await opened.arrayBuffer(); -->
				<!-- 		const blob = new Blob([fileContent]); -->
				<!-- 		const link = document.createElement("a"); -->
				<!-- 		link.href = URL.createObjectURL(blob); -->
				<!-- 		link.download = f.name; -->
				<!-- 		link.click(); -->
				<!-- 		URL.revokeObjectURL(link.href); -->
				<!-- 	}} -->
				<!-- > -->
				<!-- 	<Download aria-label={t("Download")} /> -->
				<!-- </button> -->

				<!-- <input -->
				<!-- 	type="file" -->
				<!-- 	hidden -->
				<!-- 	oninput={async (ev) => { -->
				<!-- 		const input = ev.currentTarget; -->
				<!-- 		if (input.files?.length !== 1) return; -->
				<!-- 		const uploadedBytes = await input.files[0].bytes(); -->
				<!-- 		await db.close(); -->
				<!-- 		await db.write([path, f.name].join("/"), uploadedBytes); -->
				<!-- 		entries = walk(dir); -->
				<!-- 	}} -->
				<!-- /> -->
				<!-- <button -->
				<!-- 	onclick={(ev) => -->
				<!-- 		( -->
				<!-- 			ev.currentTarget.previousElementSibling as HTMLInputElement -->
				<!-- 		).click()} -->
				<!-- > -->
				<!-- 	<Upload aria-label={t("Upload")} /> -->
				<!-- </button> -->
			{/if}
		</li>
	{/each}
</ul>

<style>
ul :global(ul) {
	padding-inline-start: --spacing(4);
}
</style>
