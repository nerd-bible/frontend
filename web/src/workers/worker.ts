import { expose } from "comlink";
import { OPFSSync } from "opfs-worker/pure";

export class Api {
	fs = new OPFSSync()
}
expose(new Api());
