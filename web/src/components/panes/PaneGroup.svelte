<script lang="ts">
import type { Snippet } from "svelte";
import type { Attachment } from "svelte/attachments";
import type { ClassValue } from "svelte/elements";

interface Props {
	children: Snippet;
	class?: ClassValue | undefined | null;
	style?: string | undefined | null;
}
let { children, class: className, style }: Props = $props();
let container: HTMLElement;
let prevSibling: HTMLElement | undefined;
let nextSibling: HTMLElement | undefined;
let pointerLast = -1;

const attachment: Attachment = (div) => {
	for (let i = 0; i < div.children.length; i++) {
		const child = div.children[i];
		// if (child.hasAttribute("data-pane"))
		// 	child.style.width = child.clientWidth + "px";
	}
};
function onPointerUp(ev: PointerEvent) {
	prevSibling = undefined;
	nextSibling = undefined;
	ev.preventDefault();
}
</script>

<svelte:document
	onpointerdown={(ev) => {
		const target = ev.target as HTMLElement;
		if (!target.hasAttribute("data-resizer")) return;
		pointerLast = ev.screenX;
		prevSibling = target.previousElementSibling as HTMLElement;
		nextSibling = target.nextElementSibling as HTMLElement;
		ev.preventDefault();
	}}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	onpointermove={(ev) => {
		if (!prevSibling || !nextSibling) return;

		const diff = ev.screenX - pointerLast;
		const prevWidth = prevSibling.clientWidth;
		const nextWidth = nextSibling.clientWidth;
		const parentWidth = container.clientWidth;

		prevSibling.style.width = ((prevWidth + diff) * 100 / parentWidth).toFixed(2) + "%";
		nextSibling.style.width = ((nextWidth - diff) * 100 / parentWidth).toFixed(2) + "%";

		pointerLast = ev.screenX;
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
