<script lang="ts">
import Editor from "../components/editor/Editor.svelte";
import { route } from '../routes.ts';

const book = $derived(route.getParams("/:id").id);
</script>

<main>
	<Editor {book} />
</main>
<style>
main {
	padding: --spacing(4) 0;
	max-width: 100%;
	margin: 0 auto;
}
</style>
