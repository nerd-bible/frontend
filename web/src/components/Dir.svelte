<script lang="ts">
import Dir from "./Dir.svelte";
import { db } from "../workers/dispatcher.svelte.ts";
import Delete from "virtual:icons/lucide/trash";
import Download from "virtual:icons/lucide/download";
import Upload from "virtual:icons/lucide/upload";
import { t } from "../l10n.svelte.ts";

let { dir, path = "" }: { dir?: FileSystemDirectoryHandle; path: string } =
	$props();

type Handle = FileSystemFileHandle | FileSystemDirectoryHandle;
async function walk(dir?: FileSystemDirectoryHandle) {
	const res: Handle[] = [];
	if (dir) for await (const handle of dir.values()) res.push(handle);

	return res;
}

let entries = $derived(walk(dir));
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
				<button
					onclick={async () => {
						await db.close();
						await dir!.removeEntry(f.name, { recursive: true });
						entries = walk(dir);
					}}
				>
					<Delete aria-label={t("Delete")} />
				</button>
				{#if f.kind === "directory"}
					<Dir dir={f} path={[path, f.name].join("/")} />
				{:else}
					<button
						onclick={async () => {
							const opened = await f.getFile();
							const fileContent = await opened.arrayBuffer();
							const blob = new Blob([fileContent]);
							const link = document.createElement("a");
							link.href = URL.createObjectURL(blob);
							link.download = f.name;
							link.click();
							URL.revokeObjectURL(link.href);
						}}
					>
						<Download aria-label={t("Download")} />
					</button>

					<input
						type="file"
						hidden
						oninput={async (ev) => {
							const input = ev.currentTarget;
							if (input.files?.length !== 1) return;
							const uploadedBytes = await input.files[0].bytes();
							await db.close();
							await db.write([path, f.name].join("/"), uploadedBytes);
							entries = walk(dir);
						}}
					/>
					<button
						onclick={(ev) =>
							(
								ev.currentTarget.previousElementSibling as HTMLInputElement
							).click()}
					>
						<Upload aria-label={t("Upload")} />
					</button>
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
