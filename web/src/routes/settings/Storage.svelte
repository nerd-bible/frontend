<script lang="ts">
import Dir from "../../components/Dir.svelte";
import { t } from "../../l10n.svelte";
import { reset, length } from "../../settings.svelte";

let dir = $state<FileSystemDirectoryHandle>();
navigator.storage.getDirectory().then((res) => (dir = res));
</script>

<div>
	<h1>{t("Storage")}</h1>
	<h2>{t("Files")}</h2>
	<Dir {dir} />
	<h2>{t("Local settings")}</h2>
	<p>{length.n} items</p>
	<button onclick={reset}>
		{t("Clear local storage")}
	</button>
</div>
