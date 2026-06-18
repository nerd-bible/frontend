<script lang="ts">
// TODO: keyboard controls
// inspiration: https://codepen.io/roblevin/pen/qBXmvoL
type Props = {
	items: { label: string; component: any }[];
	active?: number;
	class?: string;
};
let {
	items = [],
	active = $bindable(0),
	class: className = "",
}: Props = $props();

const uid = $props.id();
</script>

<section class={className}>
	<ul
		class="scrollable fadedown"
		role="tablist"
		onwheel={(ev) => {
			ev.preventDefault();
			ev.currentTarget.scrollBy({ left: ev.deltaY });
		}}
	>
		{#each items as item, i}
			<li>
				<button
					role="tab"
					aria-controls={uid}
					aria-selected={i === active}
					onclick={() => {
						active = i;
					}}>{item.label}</button
				>
			</li>
		{/each}
	</ul>
	<div id={uid} role="tabpanel">
		{@render items[active].component()}
	</div>
</section>

<style>
section {
	--border-size: --spacing(1);
	--border-color: var(--color-bg-200);
	--border: var(--border-size) solid var(--border-color);
	height: fit-content; /** fix sticky */
}
[role="tablist"] {
	position: sticky;
	top: 0;
	z-index: 1;
	display: flex;
	flex-wrap: wrap;
	overflow: auto;
	flex-wrap: nowrap;
	padding-bottom: --spacing(4);
}
[role="tabpanel"] {
	padding: --spacing(4);
					padding-top: 0;
}
li {
	padding: --spacing(1);

	&:has(button[aria-selected="true"]) {
		color: var(--color-fg-50);
		margin-bottom: calc(-1 * var(--border-size));
		border-bottom: var(--border-size) solid var(--color-focus-200);
		border-radius: 0;
	}
}
button {
	padding: --spacing(1);
	background: none;
	color: var(--color-fg-200);
	outline-offset: 0;
	&:where(:focus, :hover) {
		background: var(--color-bg-100);
	}
}
</style>
