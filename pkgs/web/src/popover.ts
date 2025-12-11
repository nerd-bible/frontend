// Oh, how I yearn for the popover API. Too bad it's poorly supported.
import type {
	AutoUpdateOptions,
	ComputePositionConfig,
} from "@floating-ui/dom";
import { autoUpdate, computePosition } from "@floating-ui/dom";

type Popover = {
	anchor: HTMLElement;
	floating: HTMLElement;
	stopUpdate: () => void;
};

export let active: Popover | undefined;

export function closeFloating() {
	if (active) {
		active.anchor.classList.remove("open");
		active.floating.style.display = "none";
		active.stopUpdate();
		active = undefined;
	}
}

export function floatEle(
	anchor: HTMLElement,
	floating: HTMLElement,
	options?: Partial<ComputePositionConfig>,
	watchOptions?: AutoUpdateOptions,
) {
	const stopUpdate = autoUpdate(
		anchor,
		floating,
		() =>
			computePosition(anchor, floating, options).then(({ x, y }) => {
				anchor.classList.add("open");
				Object.assign(floating.style, {
					left: `${x}px`,
					top: `${y}px`,
					display: "initial",
				});
			}),
		watchOptions,
	);
	active = { anchor, floating, stopUpdate };
}
