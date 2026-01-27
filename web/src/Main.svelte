<script>
import Header from "./components/Header.svelte";
import Loading from "./components/Loading.svelte";
import Conllu from "./components/Conllu.svelte";
import { conllu } from "@nerd-bible/core";
import settings from "./settings.svelte";

let sentences = $state.raw([]);
const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
const url = "https://cdn.jsdelivr.net/gh/mr-martian/hbo-UD@master/data/checked/genesis.conllu";

let gid = 0;
worker.addEventListener("message", (ev) => {
	const { id, data } = ev.data;
	if (id === 0) {
		sentences = data;
	}
});
worker.postMessage({ type: "get_url_sentences", id: gid, data: { url } });
</script>

<Header />
<main style:max-width={`${settings.columnWidth}px`} style:font-size={`${settings.fontSize}px`}>
	{#if sentences.length}
		<Conllu {sentences} />
	{:else}
		<Loading />
	{/if}
</main>
