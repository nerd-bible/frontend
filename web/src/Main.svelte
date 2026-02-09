<script lang="ts">
import Header from "./components/Header.svelte";
import Loading from "./components/Loading.svelte";
import Conllu from "./components/Conllu.svelte";
import { settings } from "./settings.svelte";
import { tableFromIPC } from '@uwdata/flechette';

let words = $state.raw();
const worker = new Worker(new URL("./nb-worker.ts", import.meta.url), { type: "module" });
const url = "https://cdn.jsdelivr.net/gh/mr-martian/hbo-UD@master/data/checked/genesis.conllu";

let gid = 0;
worker.addEventListener("message", (ev) => {
	const { id, data } = ev.data;
	if (id === -1) {
		// Ready
		worker.postMessage({ type: "get_url_words", id: gid, data: { url } });
	}
	if (id === 0) {
		words = tableFromIPC(data);
	}
});
</script>

<Header />
<main style:max-width={`${settings.columnWidth}px`} style:font-size={`${settings.fontSize}px`}>
	{#if words}
		<Conllu {words} />
	{:else}
		<Loading />
	{/if}
</main>
