import {
	type Table,
	map,
	uint16,
	utf8,
	tableFromArrays,
	tableToIPC,
} from "@uwdata/flechette";
import { init, DuckDB } from "@ducklings/browser";
import { conllu, ref } from "@nerd-bible/core";

console.log("Worker starting");
const string = () => utf8();
const sentenceSchema = {
	docId: string(),
	id: uint16(),
	headers: map(string(), string()),
	position: uint16(),
};
const wordSchema = {
	docId: string(),
	sentId: uint16(),
	id: uint16(),
	form: string(),
	lemma: string(),
	upos: string(),
	xpos: string(),
	feats: map(string(), string()),
	head: uint16(),
	deprel: string(),
	deps: map(string(), uint16()),
	misc: map(string(), string()),
	type: string(),
	chapter: uint16(),
	verse: string(),
	position: uint16(),
};
export type SentenceTable = Table;
export type WordTable = Table;

function parseConlluDoc(
	docId: string,
	source: string,
): { sentences: SentenceTable; words: WordTable } {
	const sentenceCols = {
		docId: [] as string[],
		id: [] as number[],
		headers: [] as [string, string][][],
		position: [] as number[],
	} satisfies Record<keyof typeof sentenceSchema, any[]>;
	const wordCols = {
		docId: [] as string[],
		sentId: [] as number[],
		id: [] as number[],
		form: [] as (string | undefined)[],
		lemma: [] as (string | undefined)[],
		upos: [] as (string | undefined)[],
		xpos: [] as (string | undefined)[],
		feats: [] as [string, string][][],
		head: [] as (number | undefined)[],
		deprel: [] as (string | undefined)[],
		deps: [] as [number, string][][],
		misc: [] as [string, string][][],
		type: [] as (string | undefined)[],
		chapter: [] as (number | undefined)[],
		verse: [] as (string | undefined)[],
		position: [] as number[],
	} satisfies Record<keyof typeof wordSchema, any[]>;

	console.time("parse conllu");
	const parsed = conllu.normal.decode(source);
	if (!parsed.success) {
		console.error(parsed.errors);
		throw new Error(parsed.errors);
	}
	console.timeEnd("parse conllu");

	console.time("transform conllu");
	let chapter: number | undefined;
	let verse: string | undefined;
	let nextParaClass: string | undefined;
	for (let i = 0; i < parsed.output.length; i++) {
		const sent = parsed.output[i];
		const sentId = i + 1;
		const sentence = {
			headers: sent.headers,
			text: "",
		};

		const widMap: Record<string, number> = {
			"0": 0, // root
		};
		let subWordUntil = "";
		let wordColsStart = wordCols.id.length;
		for (let j = 0; j < sent.words.length; j++) {
			const w = sent.words[j];

			if (w.lemma === "פ" || w.lemma === "ס") {
				nextParaClass = w.lemma;
				continue;
			}
			if (nextParaClass) {
				w.misc["newpar"] = nextParaClass;
				nextParaClass = undefined;
			}

			let type = "normal";
			if (subWordUntil === "") {
				sentence.text += w.form;
				if (w.misc["SpaceAfter"] !== "No") sentence.text += " ";
			} else {
				type = "subword";
			}
			if (w.id.includes("-")) {
				const [_, to] = w.id.split("-");
				subWordUntil = to;
				type = "composite";
				w.misc["Ref"] = sent.words[j + 1]?.misc["Ref"];
			} else if (w.id.includes(".")) {
				type = "ellision";
			}
			if (subWordUntil === w.id.toString()) subWordUntil = "";
			if (w.misc["Ref"]) {
				try {
					const parsed = ref.parseBcvPartOrWord(w.misc["Ref"]);
					if (parsed) {
						if ("chapter" in parsed) chapter = parsed.chapter;
						if ("verse" in parsed) verse = parsed.verse;
						delete w.misc["Ref"];
					}
				} catch {}
			}
			if (w.misc["Ref[Chapter]"]) {
				chapter = parseInt(w.misc["Ref[Chapter]"]);
				delete w.misc["Ref[Chapter]"];
			}
			if (w.misc["Ref[Verse]"]) {
				verse = w.misc["Ref[Verse]"];
				delete w.misc["Ref[Verse]"];
			}
			if (i === 0 && j === 0) w.misc["newpar"] ??= "normal";

			const wordId = j + 1;
			widMap[w.id] = wordId;

			wordCols.docId.push(docId);
			wordCols.sentId.push(sentId);
			wordCols.id.push(wordId);
			wordCols.form.push(w.form);
			wordCols.lemma.push(w.lemma);
			wordCols.upos.push(w.upos);
			wordCols.xpos.push(w.xpos);
			wordCols.feats.push(Object.entries(w.feats));
			wordCols.head.push(); // defer until mapping below
			wordCols.deprel.push(w.deprel);
			wordCols.deps.push(); // defer until mapping below
			wordCols.misc.push(Object.entries(w.misc));
			wordCols.type.push(type);
			wordCols.chapter.push(chapter);
			wordCols.verse.push(verse);
			wordCols.position.push(wordId * 256);
		}
		for (let j = 0; j < sent.words.length; j++) {
			const w = sent.words[j];
			wordCols.head[wordColsStart + j] = widMap[w.head];
			const newDeps: [number, string][] = [];
			// Conllu is `id:type` like `2:nsubj`
			for (const d in w.deps) newDeps.push([widMap[d], w.deps[d]]);
			wordCols.deps[wordColsStart + j] = newDeps;
		}

		sentenceCols.docId.push(docId);
		sentenceCols.id.push(sentId);
		sentenceCols.headers.push(Object.entries(sent.headers));
		sentenceCols.position.push(sentId * 8);
	}
	console.timeEnd("transform conllu");

	console.time("tableFromArrays");
	const res = {
		sentences: tableFromArrays(sentenceCols, { types: sentenceSchema }),
		words: tableFromArrays(wordCols, { types: wordSchema }),
	};
	console.timeEnd("tableFromArrays");

	return res;
}

export async function getUrlSentences(url: string) {
	// 	const text = `# newdoc id = gen_en_1
	// # sourcedoc id = gen_source_1
	// # sent_id = s1
	// # text = In the beginning, God created the heavens and the earth.
	// 1	In	in	ADP	_	_	3	case	_	Ref[Chapter]=1|Ref[Verse]=1|Source=s1#1
	// 2	the	the	DET	DEF	Definite=Def|PronType=Art	3	det	_	Source=s1#1
	// 3	beginning	begin	NOUN	SG-NOM	Number=Sing	6	obl	_	SpaceAfter=No|Source=s1#2
	// 4	,	,	PUNCT	Comma	_	3	punct	_	_
	// 5	God	God	PROPN	SG-NOM	Number=Sing	6	nsubj	_	Source=s1#4
	// 6	created	create	VERB	PAST	Mood=Ind|Tense=Past|VerbForm=Fin	0	root	_	Source=s1#3
	// 7	the	the	DET	DEF	Definite=Def|PronType=Art	8	det	_	Source=s1#6
	// 8	heavens	heaven	NOUN	PL-NOM	Number=Plur	6	obj	_	Source=s1#7
	// 9	and	and	CCONJ	_	_	11	cc	_	Source=s1#8
	// 10	the	the	DET	DEF	Definite=Def|PronType=Art	11	det	_	Source=s1#10
	// 11	earth	earth	NOUN	SG-NOM	Number=Sing	8	conj	_	SpaceAfter=No|Source=s1#11
	// 12	.	.	PUNCT	Period	_	6	punct	_	Source=s1#12
	//
	// # sent_id = s2
	// # text = Now the earth was formless and void, and darkness was hovering over the surface of the deep.
	// 1	Now	now	ADV	RB	_	5	advmod	_	_
	// 2	the	the	DET	DT	Definite=Def|PronType=Art	3	det	_	_
	// 3	earth	earth	NOUN	NN	Number=Sing	5	nsubj	_	_
	// 4	was	be	AUX	VBD	Mood=Ind|Number=Sing|Person=3|Tense=Past|VerbForm=Fin	5	cop	_	_
	// 5	formless	formless	ADJ	JJ	Degree=Pos	0	root	_	_
	// 6	and	and	CCONJ	CC	_	7	cc	_	_
	// 7	void	void	ADJ	JJ	Degree=Pos	5	conj	_	SpaceAfter=No
	// 8	,	,	PUNCT	,	_	12	punct	_	_
	// 9	and	and	CCONJ	CC	_	12	cc	_	_
	// 10	darkness	darkness	NOUN	NN	Number=Sing	12	nsubj	_	_
	// 11	was	be	AUX	VBD	Mood=Ind|Number=Sing|Person=3|Tense=Past|VerbForm=Fin	12	aux	_	_
	// 12	hovering	hover	VERB	VBG	Tense=Pres|VerbForm=Part	5	conj	_	_
	// 13	over	over	ADP	IN	_	15	case	_	_
	// 14	the	the	DET	DT	Definite=Def|PronType=Art	15	det	_	_
	// 15	surface	surface	NOUN	NN	Number=Sing	12	obl	_	_
	// 16	of	of	ADP	IN	_	18	case	_	_
	// 17	the	the	DET	DT	Definite=Def|PronType=Art	18	det	_	_
	// 18	deep	deep	ADJ	JJ	Degree=Pos	15	nmod	_	SpaceAfter=No
	// 19	.	.	PUNCT	.	_	5	punct	_	SpaceAfter=No
	// `;
	const text = await fetch(url).then((r) => r.text());
	return parseConlluDoc("gen", text);
}

addEventListener("message", async (ev) => {
	const { type, id, data } = ev.data;
	switch (type) {
		case "get_url_words": {
			const { url } = data;
			const { sentences, words } = await getUrlSentences(url);
			console.time("tableToIPC");
			const sentenceIpc = tableToIPC(sentences, { format: "stream" })!;
			const wordsIpc = tableToIPC(words, { format: "stream" })!;
			console.timeEnd("tableToIPC");
			console.time("insertArrowFromIPCStream");

			const conn = await getConn();
			conn.insertArrowFromIPCStream("sentences", sentenceIpc);
			conn.insertArrowFromIPCStream("words", wordsIpc);
			console.timeEnd("insertArrowFromIPCStream");
			console.time("queryArrow");
			const subtable = await conn.queryArrow(
				`select
	sentId,
	words.id as id,
	form,
	chapter,
	verse,
	misc['newpar'] as newpar,
	misc['SpaceAfter'] = 'No' as noSpaceAfter
from words
join sentences on sentences.id = sentId
where words.docId='gen' and form is not null and type not in ('subword', 'ellision')
order by sentences.position, words.position
`,
			);
			console.timeEnd("queryArrow");
			console.time("tableToIPC");
			const subtableIpc = tableToIPC(subtable, { format: "stream" })!;
			console.timeEnd("tableToIPC");
			postMessage(
				{ id, data: subtableIpc },
				{ transfer: [subtableIpc.buffer] },
			);
			break;
		}
		case "get_word": {
			const { docId, sentId, wordId } = data;

			const conn = await getConn();
			const stmt = await conn.prepare(
				"select * from words where docId=? and sentId=? and wordId=?",
			);
			stmt.bindVarchar(1, docId);
			stmt.bindUInt16(2, sentId);
			stmt.bindUInt16(3, wordId);
			const rows = await stmt.run();
			await stmt.close();
			postMessage({ id, data: rows });
			break;
		}
		default:
			throw Error(`unknown message type ${type}`);
	}
});

let db: DuckDB | undefined;
async function getDb() {
	if (db) return db;

	console.time("duckdb init");
	await init({
		wasmUrl: new URL("@ducklings/browser/wasm?url", import.meta.url).href,
		wasmJsUrl: new URL("@ducklings/browser/wasm/duckdb.js", import.meta.url)
			.href,
		worker: new Worker(new URL("@ducklings/browser/worker", import.meta.url), {
			type: "module",
		}),
	});
	console.timeEnd("duckdb init");
	return new DuckDB();
}

async function getConn() {
	const db = await getDb();
	return db.connect();
}

async function initWorker() {
	// Ready to start receiving messages.
	postMessage({ id: -1 });
}
initWorker();
