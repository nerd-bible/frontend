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
import type { conllu } from "@nerd-bible/core";
import type * as z from "@nerd-bible/valio";

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
					visibility: "visible",
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

type Sentences = z.Output<typeof conllu.normal>;
type WordElement = HTMLSpanElement & {
	conllu: Sentences[number]["words"][number];
};

worker.postMessage({ sentences: "gen" });
worker.addEventListener("message", (ev) => {
	main.innerHTML = "";

	const sentences: Sentences = ev.data;
	let p: HTMLParagraphElement | undefined;
	for (const s of sentences) {
		const newpar = s.headers["newpar"];
		if (newpar != null) {
			if (p) main.appendChild(p);
			p = document.createElement("p");
			if (newpar) p.className = newpar;
		}

		for (const w of s.words) {
			const span = document.createElement("span") as WordElement;
			span.tabIndex = 0;
			span.textContent = w.form;
			span.conllu = w;
			p?.appendChild(span);
			if (w.misc["SpaceAfter"] !== "No") {
				p?.appendChild(new Text(" "));
			}
		}
	}
	if (p) main.appendChild(p);
});
function flatten(obj: Record<string, any>, prefix?: string) {
	const res: Record<string, any> = {};

	for (const k in obj) {
		const val = obj[k];
		const newKey = prefix ? `${prefix}.${k}` : k;

		if (typeof val === "object") {
			if (Array.isArray(val)) {
				const { ...arrToObj } = val;
				const newObj = flatten(arrToObj, newKey);
				Object.assign(res, newObj);
			} else {
				const newObj = flatten(val, newKey);
				Object.assign(res, newObj);
			}
		} else {
			res[newKey] = val;
		}
	}

	return res;
}

const hoverBox = document.getElementById("wordHover")!;

function clickWord(target: any) {
	if (!(target instanceof HTMLElement && "conllu" in target)) {
		hoverBox.style.removeProperty("visibility");
		return;
	}

	hoverBox.innerHTML = "";
	const ul = document.createElement("ul");
	const word = (target as WordElement).conllu;
	const flattened = flatten(word);
	for (const k in flattened) {
		const li = document.createElement("li");
		li.innerText = `${k}: ${JSON.stringify(flattened[k])}`;
		ul.appendChild(li);
	}
	hoverBox.append(ul);

	floatEle(target, hoverBox, {
		middleware: [flip(), shift(), offset(2)],
	});
}

document.addEventListener("click", (ev) => clickWord(ev.target));
main.addEventListener("keypress", (ev) => {
	console.log("keypress", ev);
	if (ev.key === " " || ev.key === "Enter") clickWord(ev.target);
});
