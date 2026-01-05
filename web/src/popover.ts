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

declare global {
	interface Document {
		popover?: Popover;
	}
}

export function close() {
	const a = document.popover;
	if (a) {
		a.anchor.classList.remove("open");
		a.floating.style.display = "none";
		a.stopUpdate();
		document.popover = undefined;
	}
}

const getFocusable = (ele: HTMLElement) =>
	ele.querySelectorAll<HTMLElement>(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
	);

export function open(
	anchor: HTMLElement,
	floating: HTMLElement,
	options?: Partial<ComputePositionConfig & { focusFirstFloatingEle: boolean }>,
	watchOptions?: AutoUpdateOptions,
) {
	const stopUpdate = autoUpdate(
		anchor,
		floating,
		() =>
			computePosition(anchor, floating, options).then(({ x, y }) => {
				Object.assign(floating.style, {
					left: `${x}px`,
					top: `${y}px`,
					display: "initial",
				});
				anchor.classList.add("open");
				if (options?.focusFirstFloatingEle) {
					const focusable = getFocusable(floating);
					focusable[0]?.focus();
				}
			}),
		watchOptions,
	);
	document.popover = { anchor, floating, stopUpdate };
}

document.addEventListener("keydown", (ev) => {
	if (ev.key === "Escape") close();
	if (ev.key === " " || ev.key === "Enter") clickWord(ev.target);
	// trap focus in floating element
	const a = document.popover;
	if (a && ev.key === "Tab") {
		const focusable = getFocusable(a.floating);
		let foundIndex = -1;
		for (let i = 0; i < focusable.length; i++) {
			if (focusable[i] === document.activeElement) {
				foundIndex = i;
				break;
			}
		}
		if (foundIndex === -1) {
			focusable[0]?.focus();
		} else if (ev.shiftKey) {
			(focusable[foundIndex - 1] ?? focusable[focusable.length - 1]).focus();
		} else {
			(focusable[foundIndex + 1] ?? focusable[0]).focus();
		}
		ev.preventDefault();
	}
});

document.addEventListener("click", (ev) => {
	const a = document.popover;
	if (!a?.floating.contains(ev.target as HTMLElement)) close();
	// conllu
	clickWord(ev.target);

	// settings menu
	const settingsToggle = document.getElementById(
		"settingsToggle",
	)! as HTMLButtonElement;
	if (
		settingsToggle.contains(ev.target as HTMLElement) &&
		a?.anchor !== settingsToggle
	)
		open(
			settingsToggle,
			document.getElementById("settings")!,
			{
				placement: "bottom-end",
				middleware: [shift(), offset(2)],
			},
			{
				ancestorScroll: false,
			},
		);
});

// Makes selecting without focusing a word possible.
let lastPointerDown:
	| {
			ele: HTMLElement;
			tabIndex: number;
	  }
	| undefined;
document.addEventListener("pointerdown", (ev) => {
	const t = ev.target as HTMLElement | null;
	if (t?.hasAttribute("tabIndex")) {
		lastPointerDown = { ele: t, tabIndex: t.tabIndex };
		t.removeAttribute("tabIndex");
	}
});

// TODO: Test more browsers + devices to ensure this ALWAYS
// follows a "pointerdown".
document.addEventListener("pointerup", () => {
	if (lastPointerDown) {
		lastPointerDown.ele.tabIndex = lastPointerDown.tabIndex;
		lastPointerDown = undefined;
	}
});
