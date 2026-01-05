import * as duckdb from "@duckdb/duckdb-wasm/dist/duckdb-browser";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import * as core from "@nerd-bible/core";
// import sqlite3InitModule, {
// 	type Database,
// 	type Sqlite3Static,
// } from "@sqlite.org/sqlite-wasm";
// import { type IDBPDatabase, openDB } from "idb";
// import initSqlJs, {
// 	type Database as SqlDatabase,
// 	type SqlJsStatic,
// } from "sql.js/dist/sql-wasm-debug.js";
// import sqliteUrl from "sql.js/dist/sql-wasm-debug.wasm?url";
// import * as SQLite from "wa-sqlite";
// import SQLiteESMFactory from "wa-sqlite/dist/wa-sqlite.mjs";

// if (import.meta.env["IS_TAURI"]) {
// 	throw new Error("add tauri");
// }

// async function insertSql(conllu: string, exec: (sql: string) => Promise<void>) {
// 	console.time("parse");
// 	const parsed = core.conllu.normal.decode(conllu);
// 	console.timeEnd("parse");
// 	await exec("begin transaction");
// 	let sql = "insert into word values";
// 	if (parsed.success) {
// 		for (const s of parsed.output) {
// 			for (const w of s.words) {
// 				sql += "\n(";
// 				for (const p in w) {
// 					sql += "'";
// 					const v = w[p as keyof typeof w];
// 					if (typeof v === "object") sql += JSON.stringify(v);
// 					else sql += v;
// 					sql += "',";
// 				}
// 				sql = sql.substring(0, sql.length - 1);
// 				sql += "),";
// 				if (sql.length > 1 << 14) {
// 					sql = sql.substring(0, sql.length - 1);
// 					await exec(sql);
// 					sql = "insert into word values";
// 				}
// 			}
// 		}
// 	} else {
// 		console.error(parsed.errors);
// 	}
// 	sql = sql.substring(0, sql.length - 1);
// 	await exec(sql);
// 	await exec("commit");
// }

// query: 397.93798828125 ms
// total: 1555.0478515625 ms
// export class Sqlite3 {
// 	static sqlite3: Sqlite3Static;
// 	db: Database;
//
// 	static async init() {
// 		console.time("initModule");
// 		Sqlite3.sqlite3 = await sqlite3InitModule({
// 			print: console.log,
// 			printErr: console.error,
// 		});
// 		console.timeEnd("initModule");
// 	}
//
// 	constructor() {
// 		this.db = new Sqlite3.sqlite3.oo1.DB(":memory:", "c");
// 		const schema = core.schema.sqliteCreateTable("word", core.conllu.word);
// 		this.db.exec(schema);
// 	}
//
// 	async insert(conllu: string) {
// 		await insertSql(conllu, async (sql) => {
// 			this.db.exec(sql);
// 		});
// 	}
//
// 	async getAll() {
// 		// console.log(
// 		// 	this.db.exec("select count(*) from word", { returnValue: "resultRows" }),
// 		// );
// 		return this.db.exec("select * from word", {
// 			// callback(row) {
// 			// 	res.push(row);
// 			// },
// 			returnValue: "resultRows",
// 			rowMode: "object",
// 		});
// 	}
// }

// query: 26.951171875 ms
// query: 251 ms
// total: 1200 ms
// export class SqlJs {
// 	static sqlite3: SqlJsStatic;
// 	db: SqlDatabase;
//
// 	static async init() {
// 		console.time("initModule");
// 		SqlJs.sqlite3 = await initSqlJs({ locateFile: () => sqliteUrl });
// 		console.timeEnd("initModule");
// 	}
//
// 	constructor() {
// 		this.db = new SqlJs.sqlite3.Database();
// 		const schema = core.schema.sqliteCreateTable("word", core.conllu.word);
// 		this.db.run(schema);
// 	}
//
// 	async insert(conllu: string) {
// 		await insertSql(conllu, async (sql) => {
// 			this.db.run(sql);
// 		});
// 	}
//
// 	async getAll() {
// 		// console.log(
// 		// 	this.db.exec("select count(*) from word", { returnValue: "resultRows" }),
// 		// );
// 		return this.db.exec("select * from word")[0].values;
// 	}
// }

// export class WaSql {
// 	static sqlite3: SQLiteAPI;
// 	static db: number;
//
// 	static async init() {
// 		console.time("initModule");
// 		const module = await SQLiteESMFactory();
// 		WaSql.sqlite3 = SQLite.Factory(module);
// 		console.timeEnd("initModule");
//
// 		WaSql.db = await WaSql.sqlite3.open_v2("myDB");
// 		const schema = core.schema.sqliteCreateTable("word", core.conllu.word);
// 		await WaSql.sqlite3.exec(WaSql.db, schema);
// 	}
//
// 	async insert(conllu: string) {
// 		await insertSql(conllu, async (sql) => {
// 			await WaSql.sqlite3.exec(WaSql.db, sql);
// 		});
// 	}
//
// 	async getAll() {
// 		// console.log(
// 		// 	this.db.exec("select count(*) from word", { returnValue: "resultRows" }),
// 		// );
// 		const res = [];
// 		await WaSql.sqlite3.exec(WaSql.db, "select * from word", (row, col) => {
// 			res.push(row);
// 		});
// 		return res;
// 	}
// }

// query: 43 ms
// query: 70 ms
// total: 2177 ms
export class DuckDb {
	static db: duckdb.AsyncDuckDB;

	static async init() {
		console.time("initModule");
		const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
			mvp: {
				mainModule: duckdb_wasm,
				mainWorker: mvp_worker,
			},
			eh: {
				mainModule: duckdb_wasm_eh,
				mainWorker: eh_worker,
			},
		};
		// Select a bundle based on browser checks
		const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
		// Instantiate the asynchronous version of DuckDB-wasm
		const worker2 = new Worker(bundle.mainWorker!);
		const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
		DuckDb.db = new duckdb.AsyncDuckDB(logger, worker2);
		await DuckDb.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
		console.timeEnd("initModule");
	}

	async insert(conllu: string) {
		const c = await DuckDb.db.connect();

		const schema = core.schema.sqliteCreateTable("word", core.conllu.word);
		await c.query(schema);

		console.time("parse");
		const parsed = core.conllu.normal.decode(conllu);
		console.timeEnd("parse");
		let csv = "";
		if (parsed.success) {
			for (const s of parsed.output) {
				for (const w of s.words) {
					for (const p in w) {
						const v = w[p as keyof typeof w];
						if (typeof v === "object") csv += JSON.stringify(v);
						else csv += v;
						if (p !== "misc") csv += "\t";
					}
					csv += "\n";
				}
			}
		} else {
			console.error(parsed.errors);
		}

		await DuckDb.db.registerFileText("data.csv", csv);
		await c.insertCSVFromPath("data.csv", {
			name: "word",
			create: false,
			header: false,
			delimiter: "\t",
		});

		await c.close();
	}

	async getAll() {
		const c = await DuckDb.db.connect();
		const res = await c.query("select * from word");
		return res.toArray();
	}
}

// query: 160.547119140625 ms
// total: 3128.424072265625 ms
// export class Idb {
// 	static db: IDBPDatabase;
//
// 	static async init() {
// 		Idb.db = await openDB("foo", 3, {
// 			upgrade(db, oldVersion, newVersion, transaction, event) {
// 				console.log("UPGRADE");
// 				db.deleteObjectStore("word");
// 				db.createObjectStore("word", { autoIncrement: true });
// 			},
// 			// blocked(currentVersion, blockedVersion, event) {
// 			// 	// …
// 			// },
// 			// blocking(currentVersion, blockedVersion, event) {
// 			// 	// …
// 			// },
// 			// terminated() {
// 			// 	// …
// 			// },
// 		});
// 	}
//
// 	async insert(conllu: string) {
// 		console.time("parse");
// 		const parsed = core.conllu.normal.decode(conllu);
// 		console.timeEnd("parse");
// 		const tx = Idb.db.transaction("word", "readwrite");
// 		const promises: Promise<any>[] = [];
// 		if (parsed.success) {
// 			for (const s of parsed.output) {
// 				for (const w of s.words) {
// 					promises.push(tx.store.add(w));
// 				}
// 			}
// 		} else {
// 			console.error(parsed.errors);
// 		}
// 		await Promise.all(promises);
// 		await tx.done;
// 	}
//
// 	async getAll() {
// 		return Idb.db.getAll("word");
// 	}
// }
