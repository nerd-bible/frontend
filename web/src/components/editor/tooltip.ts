	import { computePosition, autoUpdate, flip, offset, shift, inline } from '@floating-ui/dom';

	$effect(() => {
		const reference = selectedRange;
		const target = tooltip;
		if (!reference) return;

		const updatePosition = () => computePosition(reference, target, {
			placement: "bottom",
			middleware: [
				offset(4),
				flip(),
				shift(),
				inline(),
			],
		}).then(({ x, y }) => {
			if (tooltip) Object.assign(tooltip.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});

		cleanup();
		cleanup = autoUpdate(reference, target, updatePosition, { layoutShift: false });
	});

<div
	class="tooltip"
	bind:this={tooltip}
	style:display={selectedRange ? "" : "none"}
>
	<button onclick={() => annotateRange(selectedRange!, "red")}>red</button>
	<button onclick={() => annotateRange(selectedRange!, "green")}>green</button>
</div>
