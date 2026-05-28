<script lang="ts">
	import type { Snippet, ClassValue } from 'svelte';

	interface Props {
		children: Snippet;
		class?: ClassValue | undefined | null;
		width?: string;
	}
	let { children, class: className, width = "auto" }: Props = $props();
</script>
<div data-pane style:width={width} class={className}>
	{@render children()}
</div>
<style>
div {
	overflow: hidden;
}
</style>
