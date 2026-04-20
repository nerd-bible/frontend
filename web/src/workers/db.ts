import * as Comlink from "comlink";
import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite.mjs";
import * as SQLite from "wa-sqlite";
import { OPFSCoopSyncVFS as MyVFS } from "wa-sqlite/src/examples/OPFSCoopSyncVFS.js";
import { sqlite, gen, exo } from "@nerd-bible/schema";

const mod = await SQLiteESMFactory();
const sqlite3 = SQLite.Factory(mod);
console.log("sqlite", sqlite3.libversion());
const vfs = await MyVFS.create("hello", mod);
sqlite3.vfs_register(vfs, true);
const db = await sqlite3.open_v2("/sample.sqlite3");

const api: sqlite.ingest.Db = {
	exec: (sql: string) => sqlite3.exec(db, sql),
	async run(sql: string) {
		let rows: Record<string, any>[] = [];
		await sqlite3.exec(db, sql, (r, c) => {
			const row: Record<string, any> = {};
			for (let i = 0; i < c.length; i++) row[c[i]] = r[i];
			rows.push(row);
		});
		return rows;
	},
};
export type Db = typeof api;
Comlink.expose(api);

await sqlite.ingest.schema(api);
if (import.meta.env.DEV && !(await api.run("select * from doc")).length) {
	console.log("seeding database");
	await api.exec("begin;");
	await sqlite.ingest.documents(api, gen);
	await sqlite.ingest.documents(api, exo);
	await sqlite.validate(api);
	await api.exec("end;analyze;");
}
