// biome-ignore lint/suspicious/noTsIgnore: temporary
// @ts-ignore asdf
import bsb from "../../core/test/bsb.conllu?raw";
import * as core from "@nerd-bible/core";

addEventListener("message", (ev) => {
	const { data } = ev;
	// console.log("got message", data, bsb.length);
	const parsed = core.conllu.normal.decode(bsb);
	if (parsed.success) {
		postMessage(parsed.output);
	} else {
		// todo
		console.error(parsed);
	}
});
