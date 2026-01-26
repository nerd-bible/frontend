<script>
import Header from "./components/Header.svelte";
import Loading from "./components/Loading.svelte";
import Conllu from "./components/Conllu.svelte";
import { conllu } from "@nerd-bible/core";
import settings from "./settings.svelte";

const url = "https://cdn.jsdelivr.net/gh/mr-martian/hbo-UD@master/data/checked/genesis.conllu";

const sentencesPromise = fetch(url).then(r => r.text()).then(t => {
	const parsed = conllu.normal.decode(t);
	if (parsed.success) {
		return parsed.output;
	} else {
		throw new Error(parsed.errors.join("\n\n"));
	}
});
</script>

<Header />
<main style:max-width={`${settings.columnWidth}px`} style:font-size={`${settings.fontSize}px`}>
	{#await sentencesPromise}
		<Loading />
	{:then sentences}
		<Conllu {sentences} />
	{:catch someError}
		System error: {someError.message}.
	{/await}
</main>
