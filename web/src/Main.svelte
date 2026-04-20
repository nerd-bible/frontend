<script lang="ts">
import Header from "./components/Header.svelte";
import { Router } from "@mateothegreat/svelte5-router";
import Reader from "./routes/Reader.svelte";
import Settings from "./routes/Settings.svelte";
import Loading from "./components/Loading.svelte";
import { db } from "./workers/dispatcher.svelte";

async function initDb() {
	await db.open();
	await db.ingest();
}
</script>

<Header />
<!-- The whole app needs the DB... -->
{#await initDb()}
	<div class="loading">
		<Loading />
	</div>
{:then}
	<Router routes={[
		{ component: Reader },
		{ path: "settings", component: Settings },
	]} />
{:catch err}
	<pre>{err?.stack ?? err}</pre>
{/await}

<style>
.loading {
	width: 100%;
	padding-top: --spacing(4);
}
</style>
