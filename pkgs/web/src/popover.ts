// Oh, how I yearn for the popover API. Too bad it's poorly supported.
import type {
	AutoUpdateOptions,
	ComputePositionConfig,
} from "@floating-ui/dom";
import { autoUpdate, computePosition, offset, shift } from "@floating-ui/dom";
import { clickWord } from "./conllu";

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

document.addEventListener("keydown", (ev) => {
	if (ev.key === "Escape") closeFloating();
	if (ev.key === " " || ev.key === "Enter") clickWord(ev.target);
});

document.addEventListener("click", (ev) => {
	if (!active?.floating.contains(ev.target as HTMLElement)) closeFloating();
	// conllu
	clickWord(ev.target);
	// settings menu
	if (
		document
			.getElementById("settingsToggle")
			?.contains(ev.target as HTMLElement)
	) {
		floatEle(
			document.getElementById("settingsToggle")!,
			document.getElementById("settings")!,
			{
				placement: "bottom-end",
				middleware: [shift(), offset(2)],
			},
			{
				ancestorScroll: false,
			},
		);
	}
});
