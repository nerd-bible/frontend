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
