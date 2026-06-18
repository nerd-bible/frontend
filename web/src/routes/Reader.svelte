<script lang="ts">
import Editor from "../components/editor/Editor.svelte";
import { route } from "../routes.ts";

const docId = $derived(route.getParams("/:docId").docId);
const ref = $derived(route.getParams("/:ref").ref);
</script>

<Editor main />
