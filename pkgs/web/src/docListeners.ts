// Single global listeners aids performance and sanity.
import { offset, shift } from "@floating-ui/dom";
import { clickWord } from "./conllu";
import { active, closeFloating, floatEle } from "./popover";

document.addEventListener("keypress", (ev) => {
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
