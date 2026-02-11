import type { Message, Request } from "./nb-worker.ts";
import { Table, tableFromIPC } from "@uwdata/flechette";

export const worker = new Worker(new URL("./nb-worker.ts", import.meta.url), { type: "module" });
let isReady = false;
let requestId = 0;

const pending = new Map<number, (data: any) => void>();
pending.set(-1, () => isReady = true);
worker.addEventListener("message", (ev) => {
	const { id, data } = ev.data;

	pending.get(id)?.(data);
	pending.delete(id);
});
// TODO: error handling
// worker.addEventListener("messageerror"

async function ready(): Promise<boolean> {
	if (isReady) return true;
	
	return new Promise((res, rej) => {
		worker.addEventListener("message", (ev) => ev.data.id === -1 && res(true));
		setTimeout(() => rej("timeout"), 5000);
	});
}

export async function request(msg: Message): Promise<any> {
	await ready();

	return new Promise((res, rej) => {
		const req = msg as Request;
		req.id = requestId++;
		pending.set(req.id, (data) => res(data));
		worker.postMessage(req);
		setTimeout(() => rej("timeout"), 5000);
	});
}

const url = "https://cdn.jsdelivr.net/gh/mr-martian/hbo-UD@master/data/checked/genesis.conllu";
export const firstIngestRequest = request({ type: "ingestUrl", data: { url } });

export async function query(query: string): Promise<Table> {
	await ready();

	return new Promise((res, rej) => {
		const req: Request = { type: "query", id: requestId++, data: { query } };
		pending.set(req.id, (data) => res(tableFromIPC(data, { useProxy: true })));
		worker.postMessage(req);
		setTimeout(() => rej("timeout"), 5000);
	});
}

