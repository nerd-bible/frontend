import { flip, offset, shift } from "@floating-ui/dom";
import type { conllu } from "@nerd-bible/core";
import type * as z from "@nerd-bible/valio";
import { open } from "./popover";

type Sentences = z.Output<typeof conllu.normal>;
type WordElement = HTMLSpanElement & {
	conllu: Sentences[number]["words"][number];
};

const _main = document.querySelector("main")!;
const worker = new Worker(new URL("./worker", import.meta.url), {
	type: "module",
});
worker.postMessage({ sentences: "gen" });
// worker.addEventListener("message", (ev) => {
// 	main.innerHTML = "";
//
// 	const sentences: Sentences = ev.data;
// 	let p: HTMLParagraphElement | undefined;
// 	for (const s of sentences) {
// 		const newpar = s.headers["newpar"];
// 		if (newpar != null) {
// 			if (p) main.appendChild(p);
// 			p = document.createElement("p");
// 			if (newpar) p.className = newpar;
// 		}
//
// 		for (const w of s.words) {
// 			const span = document.createElement("span") as WordElement;
// 			span.tabIndex = 0;
// 			span.textContent = w.form;
// 			span.conllu = w;
// 			p?.appendChild(span);
// 			if (w.misc["SpaceAfter"] !== "No") {
// 				p?.appendChild(new Text(" "));
// 			}
// 		}
// 	}
// 	if (p) main.appendChild(p);
// });

const searchInput = document.getElementById("search") as HTMLInputElement;
const searchForm = searchInput?.parentElement as HTMLFormElement;
searchForm?.addEventListener("submit", (ev) => {
	// const query = searchInput?.value;
	ev.preventDefault();
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

export function clickWord(target: any) {
	if (!(target instanceof HTMLElement && "conllu" in target)) return;

	const hoverBox = document.getElementById("wordHover")!;
	hoverBox.innerHTML = "";
	const ul = document.createElement("ul");
	const word = (target as WordElement).conllu;
	const flattened = flatten(word);
	for (const k in flattened) {
		const li = document.createElement("li");
		const key = document.createElement("span");
		key.textContent = k;
		const value = document.createElement("span");
		value.textContent = flattened[k];
		li.appendChild(key);
		li.appendChild(value);
		ul.appendChild(li);
	}
	hoverBox.append(ul);

	open(target, hoverBox, {
		middleware: [flip(), shift(), offset(2)],
	});
}
