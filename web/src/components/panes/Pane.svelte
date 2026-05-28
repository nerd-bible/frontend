<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

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
