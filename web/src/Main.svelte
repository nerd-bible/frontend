<script lang="ts">
import Header from "./components/Header.svelte";
import { Router } from "@mateothegreat/svelte5-router";
import Reader from "./routes/Reader.svelte";
import Settings from "./routes/settings/Index.svelte";
</script>

<Header />
<Router
	routes={[{ component: Reader }, { path: "settings", component: Settings }]}
/>
