import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import ProgressBar from "progress";

async function fetchWithProgress(
	url: string,
	opts = { log: true },
) {
	if (opts.log) console.log(url);
	const resp = await fetch(url);

	const contentLengthStr = resp.headers.get("content-length");
	if (!contentLengthStr) throw `${url} missing content-length`;
	const total = Number.parseInt(contentLengthStr, 10);

	let progress: ProgressBar | undefined;
	if (opts.log) {
		progress = new ProgressBar(":bar :percent (:eta remaining)", {
			total,
			width: url.length,
		});
	}
	if (!resp.body) throw `${url} missing body`;

	return { resp, total, progress };
}

/* Stream GET to file with a progress bar. */
export async function file(
	url: string,
	path: string,
	opts = {
		log: true,
		mkdir: true,
	},
): Promise<void> {
	const { resp, progress } = await fetchWithProgress(url, opts);

	const reader = resp.body!.getReader();
	if (opts.mkdir) await mkdir(dirname(path), { recursive: true });
	const file = createWriteStream(path);

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		progress?.tick(value.length);
		file.write(value);
	}
	file.close();
	return new Promise<void>((res) => file.on("close", res));
}

/* Stream GET to buffer with a progress bar. */
export async function buffer(
	url: string,
	opts = { log: true },
): Promise<Uint8Array> {
	const { resp, total, progress } = await fetchWithProgress(url, opts);
	const reader = resp.body!.getReader();
	const res = new Uint8Array(total);
	let pos = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		progress?.tick(value.length);
		res.set(value, pos);
		pos += value.length;
	}
	return res;
}
