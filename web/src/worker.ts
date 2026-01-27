console.log("Worker loading");

import { conllu } from "@nerd-bible/core";

// import { DuckDb } from "./db";
//
// const DB = DuckDb;
// console.time("total");
// console.time("start");
// await DB.init();
// const db = new DB();
// console.timeEnd("start");
//
// console.time("insert");
// await db.insert(bsb);
// console.timeEnd("insert");

// console.time("query");
// const idk = await db.getAll();
// let sum = 0;
// for (const a of idk) {
// 	sum += (a.form ?? a[1])?.length ?? 0;
// }
// console.log(sum);
// console.timeEnd("query");
// console.timeEnd("total");

async function getUrlSentences(url: string) {
	const t = await fetch(url).then((r) => r.text());
	const parsed = conllu.normal.decode(t);
	if (parsed.success) {
		return parsed.output;
	} else {
		throw new Error(parsed.errors.join("\n\n"));
	}
}

addEventListener("message", async (ev) => {
	const { type, id, data } = ev.data;

	switch (type) {
		case "get_url_sentences": {
			const data2 = await getUrlSentences(data.url);
			postMessage({ id, data: data2 });
			break;
		}
		default:
			throw Error(`unknown message type ${type}`);
	}
});
