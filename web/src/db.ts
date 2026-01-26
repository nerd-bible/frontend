import * as core from "@nerd-bible/core";
import { init, version, getDB, type DuckDB, type Connection, type Table } from '@ducklings/browser';

export class DuckDb {
	static db: duckdb.AsyncDuckDB;

	static async init() {
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
	}

	async getAll() {
		const c = await DuckDb.db.connect();
		const res = await c.query("select * from word");
		return res.toArray();
	}
}
