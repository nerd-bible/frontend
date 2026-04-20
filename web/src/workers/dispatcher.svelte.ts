import * as Comlink from "comlink";
import type { Db } from "./db.ts";

export const db: Comlink.Remote<Db> = Comlink.wrap(
	new Worker(new URL("./db.ts", import.meta.url), { type: "module" }),
);
