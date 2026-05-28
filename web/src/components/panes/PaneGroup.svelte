<script lang="ts">
import type { Snippet } from "svelte";
import type { Attachment } from "svelte/attachments";
import type { ClassValue } from "svelte/elements";

interface Props {
	children: Snippet;
	class?: ClassValue | undefined | null;
}
let { children, class: className }: Props = $props();
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
		if (!ev.target.hasAttribute("data-resizer")) return;
		pointerLast = ev.screenX;
		prevSibling = (ev.target as HTMLElement).previousElementSibling;
		nextSibling = (ev.target as HTMLElement).nextElementSibling;
		ev.preventDefault();
	}}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	onpointermove={(ev) => {
		if (!prevSibling || !prevSibling) return;

		const diff = ev.screenX - pointerLast;
		const prevWidth = Number.parseFloat(prevSibling.style.width);
		const nextWidth = Number.parseFloat(nextSibling.style.width);

		prevSibling.style.width = prevWidth + diff + "px";
		nextSibling.style.width = nextWidth - diff + "px";

		pointerLast = ev.screenX;
		ev.preventDefault();
	}}
/>

<div {@attach attachment} class={className}>
	{@render children()}
</div>

<style>
div {
	display: flex;
	touch-action: none;
}
</style>
