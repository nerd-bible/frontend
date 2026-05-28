<script lang="ts">
	import type { Snippet, ClassValue } from 'svelte';

	interface Props {
		children: Snippet;
		class?: ClassValue | undefined | null;
	}
	let { children, class: className }: Props = $props();
</script>
<div data-pane class={className}>
	{@render children()}
</div>
