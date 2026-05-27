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
}
div[role="tablist"] {
	display: flex;
	overflow: auto;
}
div[role="tabpanel"] {
	padding: --spacing(4);
	padding-top: --spacing(2);
}
button {
	background: none;
	border-radius: 0;
	border-bottom: 2px solid var(--color-fg-500);
	margin: --spacing(1);
	&[aria-selected="true"] {
		text-shadow: -0.03ex 0 0 currentColor, 0.03ex 0 0 currentColor;
		-webkit-text-stroke-width: 0.04ex;
		border-color: var(--color-focus-200);
	}
}
</style>
