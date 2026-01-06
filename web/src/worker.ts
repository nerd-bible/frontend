import * as core from "@nerd-bible/core";
// import { DuckDb } from "./db";
// import bsb from "/Users/zack/src/hbo-UD/data/checked/genesis.conllu?raw";
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

addEventListener("message", (ev) => {
	const { data } = ev;
	// console.log("got message", data, bsb.length);
	const parsed = core.conllu.normal.decode("");
	if (parsed.success) {
		postMessage(parsed.output);
	} else {
		// todo
		console.error(parsed);
	}
});
