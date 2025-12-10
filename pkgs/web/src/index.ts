import type {
	AutoUpdateOptions,
	ComputePositionConfig,
} from "@floating-ui/dom";
import { autoUpdate, computePosition, shift } from "@floating-ui/dom";

console.log("hello worldd");

const root = document.body;
if (!root) throw new Error("missing root");

const searchInput = root.querySelector<HTMLInputElement>("form > input");
const searchForm = searchInput?.parentElement;
searchForm?.addEventListener("submit", (ev) => {
	const query = searchInput?.value;
	console.log(query);
	ev.preventDefault();
});

function floatEle(
	anchor: HTMLElement,
	target: HTMLElement,
	options?: Partial<ComputePositionConfig>,
	watchOptions?: AutoUpdateOptions,
) {
	autoUpdate(
		anchor,
		target,
		() =>
			computePosition(anchor, target, options).then(({ x, y }) => {
				Object.assign(target.style, {
					left: `${x}px`,
					top: `${y}px`,
				});
			}),
		watchOptions,
	);
}

root.querySelectorAll("details.dropdown").forEach((e) => {
	const floating = e.querySelector<HTMLElement>(".content");
	if (!floating) return;
	floatEle(
		e as HTMLElement,
		floating,
		{
			placement: "bottom-end",
			middleware: [shift()],
		},
		{
			ancestorScroll: false,
		},
	);
});
