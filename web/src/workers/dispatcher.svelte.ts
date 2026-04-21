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
	async exec(sql: string) {
		return wrapped.exec(sql);
	},
	async run(sql: string) {
		return wrapped.run(sql);
	},
};
