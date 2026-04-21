<script lang="ts">
import Dir from "../../components/Dir.svelte";
import { reset } from "../../settings.svelte.ts";

let dir = $state<FileSystemDirectoryHandle>();
navigator.storage.getDirectory().then((res) => (dir = res));
</script>

<div>
	<Dir {dir} />
</div>
<div>
	<button onclick={reset}><span>{@html t("reset")}</span></button>
</div>
<l10n lang="en-US">
	reset = Reset <strong>all</strong> settings clear = Clear database
</l10n>
