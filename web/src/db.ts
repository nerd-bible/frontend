import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser.worker.js?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import * as core from "@nerd-bible/core";

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
		const logger = new duckdb.ConsoleLogger();
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
