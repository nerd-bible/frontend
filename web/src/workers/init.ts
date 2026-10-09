import { wrap } from "comlink";
import type { Api } from "./worker.ts";
import { OPFSFacade } from "opfs-worker";

// everthing in type already marked async
const wrapped = wrap(
	new Worker(new URL("./worker.ts", import.meta.url), { type: "module" }),
) as unknown as Api;
const fs = new OPFSFacade({ fs: wrapped.fs, dispose() {} }); 
export default { fs };

console.log("initted", fs);
const enc = new TextEncoder();
await fs.writeFile("foo", enc.encode("bar"));
const res = await fs.readFile("foo");
console.log(new TextDecoder().decode(res));

setTimeout(() => {
	console.log("anoter");
fs.writeFile("foo3", enc.encode("bar"));
}, 1000);
