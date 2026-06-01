<script lang="ts">
import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";

interface Props {
	children: Snippet;
	class?: ClassValue | undefined | null;
	width?: string;
	minWidth?: number;
	maxWidth?: number;
	collapsible?: boolean;
}
let {
	children,
	class: className,
	width = "auto",
	minWidth = 0,
	maxWidth = 2000,
	collapsible = false,
}: Props = $props();
</script>

<div
	data-pane
	data-collapsable={collapsible}
	style:width={width}
	style:min-width={minWidth + "px"}
	style:max-width={maxWidth + "px"}
	class={className}
>
	{@render children()}
</div>
