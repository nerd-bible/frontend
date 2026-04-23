<script lang="ts">
import Editor from "../components/editor/Editor.svelte";
import DbGuard from "../components/DbGuard.svelte";
import { settings } from "../settings.svelte";
import { route } from '../routes.ts';

const book = $derived(route.getParams("/:id").id);
</script>

<main
	style:width={`${settings.columnWidth}px`}
	style:--font-size={`${settings.fontSize}px`}
	style:--line-height-offset={settings.lineHeightOffset}
>
	<DbGuard>
		<Editor {book} />
	</DbGuard>
</main>

<style>
main {
	padding: --spacing(4) 0;
	max-width: 100%;
	margin: 0 auto;
	font-size: var(--font-size);
}
</style>
