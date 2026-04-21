<script lang="ts">
import { db } from "../../workers/dispatcher.svelte";

let { value = $bindable(), onResults, output } = $props();
let elapsed = $state(0);

function onSubmit(ev: SubmitEvent) {
	ev.preventDefault();
	elapsed = 0;
	let last_time = performance.now();
	let frame = requestAnimationFrame(function update(time) {
		frame = requestAnimationFrame(update);

		elapsed += time - last_time;
		last_time = time;
	});

	db.run(value).then(res => {
		cancelAnimationFrame(frame);
		onResults(res);
	});
}
</script>

<form onsubmit={onSubmit}>
	<textarea name="query" placeholder="SELECT ..." bind:value={value}></textarea>
	<div class="submit">
		<input type="submit" />
		{#await output}
			{#if elapsed > 1000}
				<p>{(elapsed / 1000).toFixed(1)}s</p>
			{/if}
		{:then v}
			{v.length} rows
		{/await}
	</div>
</form>

<style>
form {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	> textarea {
		flex-grow: 1;
	}
}
.submit {
	display: flex;
	justify-content: space-between;
}
textarea {
	width: 100%;
	height: 200px;
}
</style>
