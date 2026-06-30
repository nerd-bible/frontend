<script lang="ts">
let {
	value = $bindable(),
	min = $bindable(0),
	max = $bindable(Number.MAX_VALUE),
	multiplier = 1,
	disabled = false,
}: {
	value: number;
	min?: number;
	max?: number;
	context: HTMLDivElement;
	multiplier?: number;
	disabled?: boolean;
} = $props();

let start: undefined | number;
let startValue: undefined | number;

function clamp(n: number) {
	return Math.max(Math.min(n, max), min);
}

function onpointerdown(ev: PointerEvent) {
	ev.preventDefault();
	if (disabled) return;
	start = ev.clientX;
	startValue = value;
	document.body.style.cursor = "ew-resize";
}

function onpointermove(ev: PointerEvent) {
	if (start == null || startValue == null) return;
	const dPx = (ev.clientX - start) * multiplier;
	value = clamp(startValue + dPx);
}

function onpointerup() {
	start = undefined;
	document.body.style.cursor = "";
}
</script>

<svelte:document {onpointermove} {onpointerup} onpointercancel={onpointerup} />

<div class:disabled={disabled} class="resizer" role="separator" {onpointerdown}></div>

<style>
.resizer {
	width: 100%;
	height: 100%;
	&:not(.disabled) {
		cursor: ew-resize;
		background: linear-gradient(
			to right,
			transparent 45%,
			var(--color-bg-200) 50%,
			transparent 55%
		);
	}
	position: sticky;
	top: 0;
	touch-action: none;
}
</style>
