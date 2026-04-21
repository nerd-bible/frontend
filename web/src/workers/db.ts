import * as Comlink from "comlink";
import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite.mjs";
import * as SQLite from "wa-sqlite";
import { OPFSCoopSyncVFS as MyVFS } from "wa-sqlite/src/examples/OPFSCoopSyncVFS.js";
import { sqlite as utils, gen, exo } from "@nerd-bible/schema";

let sqlite3: SQLiteAPI;
let db = -1;
const fname = "sample.sqlite3";

const api = {
	async init(): Promise<void> {
		if (!sqlite3) {
			const mod = await SQLiteESMFactory();
			sqlite3 = SQLite.Factory(mod);
			console.log("sqlite", sqlite3.libversion());
			const vfs = await MyVFS.create("vfs", mod);
			sqlite3.vfs_register(vfs, true);
		}
	},
	async open(): Promise<void> {
		db = await sqlite3.open_v2(fname);
	},
	async close(): Promise<void> {
		if (sqlite3) {
			await sqlite3.close(db);
			db = -1;
		}
	},
	async ingest(): Promise<void> {
		await utils.ingest.schema(api);
		if (import.meta.env.DEV && !(await api.run("select * from doc")).length) {
			console.log("seeding database");
			await api.exec("begin;");
			await utils.ingest.documents(api, gen);
			await utils.ingest.documents(api, exo);
			await utils.validate(api);
			await api.exec("end;analyze;");
		}
	},
	async exec(sql: string) {
		if (db == -1) await this.open();
		await sqlite3.exec(db, sql);
	},
	async run(sql: string) {
		if (db == -1) await this.open();
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
