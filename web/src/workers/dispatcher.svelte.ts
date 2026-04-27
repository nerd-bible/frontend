import * as Comlink from "comlink";
import type { Db } from "./db.ts";

const wrapped = Comlink.wrap<Db>(
	new Worker(new URL("./db.ts", import.meta.url), { type: "module" }),
);

export let state = $state({
	initted: false,
	opened: false,
});

export const db = {
	async init(): Promise<void> {
		return wrapped.init();
	},
	async open(): Promise<void> {
		return wrapped.open();
	},
	async close(): Promise<void> {
		return wrapped.close();
	},
	async ingest(): Promise<void> {
		return wrapped.ingest();
	},
	async exec(sql: string): Promise<void> {
		return wrapped.exec(sql).catch(e => {
			throw Error(`${sql}\n\n${e}`);
		});
	},
	async run<T>(sql: string, opts?: Parameters<typeof wrapped.run>[1] ): Promise<T[]> {
		// @ts-ignore generic is lost on wrapper
		return wrapped.run(sql, opts)
			.catch(e => {
				throw Error(`${sql}\n\n${e}`);
			});
	},
	async write(path: string, data: Uint8Array): Promise<void> {
		return wrapped.write(path, Comlink.transfer(data, [data.buffer]));
	},
};

export function sql(strings: TemplateStringsArray, ...values: any[]) {
	let result = "";
	for (let i = 0; i < strings.length; i++)
		result += strings[i] + String(values[i] ?? "");
	return result;
}
