import type {
	AutoUpdateOptions,
	ComputePositionConfig,
} from "@floating-ui/dom";
import {
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
} from "@floating-ui/dom";
import { conllu } from "@nerd-bible/core";
import * as z from "@nerd-bible/valio";

console.log("Welcome to nerd.Bible");

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

const main = document.querySelector("main")!;

const worker = new Worker(new URL("./worker", import.meta.url), {
	type: "module",
});

worker.postMessage({ sentences: "gen" });
worker.addEventListener("message", (ev) => {
	main.innerHTML = "";

	const sentences: z.Output<typeof conllu.normal> = ev.data;
	let p: HTMLParagraphElement | undefined;
	for (const s of sentences) {
		const newpar = s.headers["newpar"];
		if (newpar != null) {
			if (p) main.appendChild(p);
			p = document.createElement("p");
			if (newpar) p.className = newpar;
		}

		for (const w of s.words) {
			const span = document.createElement("span");
			span.textContent = w.form;
			for (const a in w) {
				if (!["form", "feats", "deps", "misc"].includes(a)) {
					span.setAttribute(a, w[a]);
				}
			}
			p?.appendChild(span);
			if (w.misc["SpaceAfter"] !== "No") {
				p?.appendChild(new Text(" "));
			}
		}
	}
	if (p) main.appendChild(p);
});

const hoverBox = document.getElementById("wordHover")!;
main.addEventListener("pointerdown", (ev) => {
	if (ev.target instanceof HTMLElement && ev.target.tagName === "SPAN") {
		hoverBox.innerText = "hello";
		computePosition(ev.target, hoverBox, {
			placement: "bottom",
			middleware: [offset(2), flip()],
		}).then(({ x, y }) => {
			Object.assign(hoverBox.style, {
				left: `${x}px`,
				top: `${y}px`,
				display: "inline-block",
			});
		});
	}
});
