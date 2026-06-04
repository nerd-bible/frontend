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
	height: 100%;
	display: grid;
	grid-template-rows: auto 1fr;
}
[role="tablist"] {
	background: var(--color-bg-50);
	display: flex;
	flex-wrap: wrap;
}
[role="tabpanel"] {
	overflow: auto;
	padding: --spacing(4);
}
button {
	background: none;
	border-radius: 0;
	color: var(--color-fg-200);
	&[aria-selected="true"] {
		color: var(--color-fg-50);
		margin-bottom: -2px;
		border-bottom: 2px solid var(--color-focus-200);
	}
}
</style>
