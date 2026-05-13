<script lang="ts">
import Editor from "../components/editor/Editor.svelte";
import { route } from "../routes.ts";

const book = $derived(route.getParams("/:id").id);
</script>

<main>
	<Editor {book} />
</main>
