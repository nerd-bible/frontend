<script lang="ts">
import type { Snippet } from 'svelte';
import { db } from "../workers/dispatcher.svelte.ts";
import Loading from "./Loading.svelte";

interface Props {
	children: Snippet;
}
let { children }: Props = $props();

async function initDb() {
	await db.init();
	await db.open();
	await db.ingest();
}
</script>

{#await initDb()}
	<div class="loading">
		<Loading />
	</div>
{:then}
	{@render children?.()}
{/await}

<style>
.loading {
	width: 100%;
	padding-top: --spacing(4);
}
</style>
