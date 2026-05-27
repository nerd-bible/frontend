<script lang="ts">
// TODO: keyboard controls
// inspiration: https://codepen.io/roblevin/pen/qBXmvoL
type Props = { items: { label: string; component: any }[]; active: number };
let { items = [], active = $bindable(0) } = $props();

const uid = $props.id();
</script>

<section>
	<div role="tablist">
		{#each items as item, i}
			<button
				role="tab"
				aria-controls={uid}
				aria-selected={i === active}
				onclick={() => {
					active = i;
				}}>{item.label}</button
			>
		{/each}
	</div>
	<div id={uid} role="tabpanel">
		{@render items[active].component()}
	</div>
</section>

<style>
section {
	--border-size: 2px;
	--border-color: var(--color-bg-200);
	--border: var(--border-size) solid var(--border-color);
	padding: --spacing(4);
}
div[role="tablist"] {
	display: flex;
	align-items: baseline;
	gap: --spacing(2);
	overflow: auto;
	padding: 0 --spacing(2);
	padding-top: --spacing(2);
	margin-bottom: calc(-1 * var(--border-size));
	position: relative;
	z-index: 2;
}
div[role="tabpanel"] {
	padding: --spacing(4);
	border: var(--border);
	border-radius: var(--radius-md);
	position: relative;
	z-index: 1;
}
button {
	border-radius: var(--radius-md) var(--radius-md) 0 0;
	border: var(--border-size) solid transparent;
	border-bottom: none;
	&[aria-selected="true"] {
		background: var(--color-bg-50);
		border-color: var(--border-color);
	}

	&[aria-selected="false"] {
		padding-bottom: --spacing(1);
		margin-bottom: --spacing(1);
	}
}
</style>
