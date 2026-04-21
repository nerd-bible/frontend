<script lang="ts">
import Dir from "../../components/Dir.svelte";
import { reset } from "../../settings.svelte.ts";
import { t } from "../../l10n.svelte.ts";

let dir = $state<FileSystemDirectoryHandle>();
navigator.storage.getDirectory().then((res) => (dir = res));
</script>

<div>
	<Dir {dir} />
</div>
<div>
	<button onclick={reset}>
		<span>{t("Reset <strong>all</strong> settings")}</span>
	</button>
</div>
