import type {
	AutoUpdateOptions,
	ComputePositionConfig,
} from "@floating-ui/dom";
import { autoUpdate, computePosition, offset, shift } from "@floating-ui/dom";

console.log("hello worldd");
const root = document.body;

function getId<T extends HTMLElement>(id: string): T {
	const res = root.querySelector(`#${id}`);
	if (!res) throw Error(`missing element #${id}`);
	return res as T;
}

const searchInput = getId<HTMLInputElement>("search");
const searchForm = searchInput?.parentElement as HTMLFormElement;
searchForm?.addEventListener("submit", (ev) => {
	// const query = searchInput?.value;
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
			middleware: [shift(), offset(2)],
		},
		{
			ancestorScroll: false,
		},
	);
});
root.addEventListener("keydown", (ev) => {
	if (ev.key === "Escape") {
		root
			.querySelectorAll<HTMLDetailsElement>("details.dropdown")
			.forEach((e) => {
				e.removeAttribute("open");
			});
	}
});
