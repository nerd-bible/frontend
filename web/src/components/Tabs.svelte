<script lang="ts">
// TODO: keyboard controls
// inspiration: https://codepen.io/roblevin/pen/qBXmvoL
type Props = { items: { label: string; component: any }[]; active?: number };
let { items = [], active = $bindable(0) }: Props = $props();

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
[role="tablist"] {
	position: sticky;
	top: 0;
	z-index: 1;
	background: var(--color-bg-50);
	display: flex;
	flex-wrap: wrap;
	border-radius: 0;

	& > button:focus {
		outline-offset: calc(-1 * var(--outline-width));
	}
}
[role="tabpanel"] {
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
