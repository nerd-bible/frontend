<script lang="ts">
import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";

interface Props {
	children: Snippet;
	class?: ClassValue | undefined | null;
	style?: string | undefined | null;
}
let { children, class: className, style }: Props = $props();
let container: HTMLElement;
let start:
	| undefined
	| {
			pointer: number;
			pane: HTMLElement;
			paneWidth: number;
			paneMinWidth: number;
			paneMaxWidth: number;
			available: number;
	  };

function onPointerUp(ev: PointerEvent) {
	start = undefined;
	ev.preventDefault();
}
</script>

<svelte:document
	onpointerdown={(ev) => {
		const target = ev.target as HTMLElement;
		if (!target.hasAttribute("data-resizer")) return;
		const pane = target.previousElementSibling as HTMLElement | null;
		if (!pane) return;

		const parent = pane.parentElement as HTMLElement;
		let available = parent.clientWidth;
		for (let i = 0; i < parent.children.length; i++) {
			const child = parent.children[i];
			if (child.hasAttribute("data-pane") || child.hasAttribute("data-resizer"))
				available -= child.clientWidth;
		}

		const computed = getComputedStyle(pane);

		start = {
			pointer: ev.screenX,
			pane,
			paneWidth: pane.clientWidth,
			paneMinWidth: parseFloat(computed.minWidth),
			paneMaxWidth: parseFloat(computed.maxWidth),
			available,
		};

		ev.preventDefault();
	}}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	onpointermove={(ev) => {
		if (!start) return;

		const diff = Math.min(ev.screenX - start.pointer, start.available);
		start.pane.style.width =
			Math.min(
				Math.max(start.paneWidth + diff, start.paneMinWidth),
				start.paneMaxWidth,
			) + "px";

		ev.preventDefault();
	}}
/>

<div bind:this={container} class={className} {style}>
	{@render children()}
</div>

<style>
div {
	display: flex;
	touch-action: none;
}
</style>
