<script lang="ts">
let {
	value = $bindable(),
	context,
	multiplier = 1,
}: { value: number; context: HTMLDivElement; multiplier?: number } = $props();

let start: undefined | number;
let startValue: undefined | number;

function onpointerdown(ev: PointerEvent) {
	ev.preventDefault();
	start = ev.clientX;
	startValue = value;
	document.body.style.cursor = "ew-resize";
}

function onpointermove(ev: PointerEvent) {
	if (start == null) return;
	const dPx = (ev.clientX - start) * multiplier;
	const dPercent = dPx / context.clientWidth;
	value = Math.max(0, startValue + dPercent);
}

function onpointerup(ev: PointerEvent) {
	start = undefined;
	document.body.style.cursor = undefined;
}
</script>

<svelte:document {onpointermove} {onpointerup} onpointercancel={onpointerup} />

<div class="resizer" role="separator" {onpointerdown}></div>

<style>
.resizer {
	width: 100%;
	height: 100%;
	cursor: ew-resize;
	background: linear-gradient(
		to right,
		transparent 40%,
		var(--color-bg-300) 50%,
		transparent 60%
	);
	position: sticky;
	top: 0;
	touch-action: none;
}
</style>
