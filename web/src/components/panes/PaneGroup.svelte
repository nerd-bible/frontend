<script lang="ts">
import type { Snippet, ClassValue } from "svelte";
import type { Attachment } from "svelte/attachments";

interface Props {
	children: Snippet;
	class?: ClassValue | undefined | null;
}
let { children, class: className }: Props = $props();
let resizing: HTMLElement | undefined;
let pointerLast = -1;

const attachment: Attachment = (div) => {
	for (let i = 0; i < div.children.length; i++) {
		const child = div.children[i];
		// if (child.hasAttribute("data-pane"))
		// 	child.style.width = child.clientWidth + "px";
	}
};
</script>
<svelte:document
	onpointerdown={ev => {
		if (!ev.target.hasAttribute("data-resizer")) return;
		pointerLast = ev.screenX;
		resizing = (ev.target as HTMLElement).previousElementSibling;
		console.log(resizing);
		ev.preventDefault();
	}}
	onpointerup={ev => {
		resizing = undefined;
		ev.preventDefault();
	}}
	onpointermove={ev => {
		if (!resizing) return;

		const diff = ev.screenX - pointerLast;
		console.log("move", diff);
		if (!resizing.style.width) resizing.style.width = resizing.clientWidth + "px";
		const from = Number.parseFloat(resizing.style.width);
		console.log("from", from);
		resizing.style.width = from + diff + "px";
		console.log("to", resizing.style.width);
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
}
</style>
