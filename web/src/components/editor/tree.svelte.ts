import type { Doc as DocMeta } from "@nerd-bible/schema";
import { db, sql } from "../../workers/dispatcher.svelte";
import { t } from "../../l10n.svelte";
import { bsearch } from "../../bsearch";

type Word = { tag: "w"; pos: bigint; text?: string; lang?: string };
type Container =
	| { tag: "p"; class: string; children: Child[] }
	| { tag: "em"; children: Child[] }
	| { tag: "ol"; children: Child[] }
	| { tag: "ul"; children: Child[] }
	| { tag: "li"; children: Child[] }
	| { tag: "q"; children: Child[] }
	| { tag: "strong"; children: Child[] }
	| {
			tag: "ref";
			book: string;
			chapter?: number;
			verse?: number;
			children: Child[];
	  }
	| { tag: "words"; children: Word[] };
type Leaf =
	| { pos: bigint; tag: "c"; data: number }
	| { pos: bigint; tag: "v"; data: number }
	| { pos: bigint; tag: "h"; level: number; text?: string }
	| { pos: bigint; tag: "pn"; data: bigint }
	| { pos: bigint; tag: "n"; data: bigint }
	| Word;
export type Child = Container | Leaf;
export type Doc = DocMeta & { tag: "doc"; children: Child[] };

export function findPos(c?: Child): bigint {
	if (c && "pos" in c) return c.pos;
	if (c && "children" in c) return findPos(c.children[0]);

	return 0n;
}

function sortChild(a: Child, b: Child): number {
	const aPos = findPos(a);
	const bPos = findPos(b);

	const diff = aPos - bPos;
	if (diff < 0n) return -1;
	else if (diff > 0n) return 1;

	return a.tag.localeCompare(b.tag, "eng");
}

// Makes rendering to DOM much faster and may help screenreaders.
function groupAdjacentWords(c: Doc | Child) {
	if ("children" in c) {
		const newChildren: Child[] = [];
		let group: { tag: "words"; children: Word[] } | undefined;
		for (let i = 0; i < c.children.length; i++) {
			const c2 = c.children[i];
			if (c2.tag === "w" && (i == 0 || c2.tag === "w")) {
				if (!group?.children.length) {
					group = { tag: "words", children: [] as Word[] };
					newChildren.push(group);
				}
				group.children.push(c2);
			} else {
				groupAdjacentWords(c2);
				newChildren.push(c2);
				group = undefined;
			}
		}
		c.children = newChildren;
	}
}

type Mark = {
	start: bigint;
	end: bigint;
	tag: "p" | "ol" | "ul" | "li" | "q" | "em" | "strong" | "ref";
	isBlob: boolean;
	data: any;
};

function groupMarks(d: Doc, marks: Mark[]) {
	console.log(d, marks);

	// TODO: faster way than slicing per-mark?
	for (const m of marks) {
		const startIndex = bsearch(d.children as Leaf[], m.start, (l) => l.pos, "end");
		const endIndex = bsearch(d.children as Leaf[], m.end, (l) => l.pos, "end");
		console.log(m, startIndex, endIndex);
	}
}

export async function fromDoc(id: bigint): Promise<Doc> {
	const docMeta = await db.run<Omit<DocMeta, "id"> & { createdAt: number }>(sql`
		SELECT lang, createdAt, title
		FROM doc
		WHERE id = ${id};
	`);
	if (!docMeta.length) throw Error(t("No doc with id {}", { id }));

	const { lang, title, createdAt } = docMeta[0];
	const res: Doc = {
		tag: "doc",
		id,
		lang,
		title,
		createdAt: createdAt ? new Date(createdAt * 1000) : undefined,
		children: [],
	};

	const words = await db.run<{
		tag: "w";
		pos: bigint;
		lang: string;
		text: string;
	}>(sql`
		SELECT
			'w' AS tag,
			id AS pos,
			lang,
			text
		FROM word
		WHERE doc = ${id};
	`);
	res.children = words;

	const voidMarks = await db.run<{
		pos: bigint;
		tag: "c" | "v" | "h";
		isBlob: boolean;
		data: any;
	}>(sql`
		SELECT
			start AS pos,
			tag,
			typeof(data) = 'blob' AS isBlob,
			iif(typeof(data) = 'blob', json(data), data) AS data
		FROM mark
		WHERE doc = ${id} AND tag IN ('c', 'v', 'h')
		ORDER BY tag;
	`);
	for (const m of voidMarks) {
		res.children.push({
			pos: m.pos,
			tag: m.tag as any,
			data: m.isBlob ? JSON.parse(m.data) : m.data,
		});
	}

	const outline = await db.run<{
		tag: "h";
		pos: bigint;
		level: number;
		text: string;
	}>(sql`
		WITH
			cv(doc, pos, c, v) AS (
				SELECT
					doc,
					start,
					(
						SELECT
							data
						FROM mark
						WHERE doc = m.doc AND tag = 'c' AND start <= m.start
						ORDER BY start DESC
					) AS c,
					data AS v
				FROM mark AS m
				WHERE tag = 'v' AND doc = ${id}
			)
		SELECT
			'h' AS tag,
			(SELECT pos FROM cv WHERE c = chapter AND v = verse) AS pos,
			level,
			TEXT
		FROM outline
		WHERE doc = (SELECT doc FROM cv LIMIT 1);
	`);
	res.children.push(...outline);

	const marks = await db.run<Mark>(sql`
		SELECT
			start,
			end,
			tag,
			json(data) AS data
		FROM mark
		WHERE doc = ${id} AND tag IN ('p', 'ol', 'ul', 'li', 'q', 'em', 'strong', 'ref')
		ORDER BY end - start, tag;
	`);
	const lastClose: Record<string, Mark> = {};
	for (const m of marks) {
		m.data = JSON.parse(m.data);
		if (m.tag === "p" || m.tag === "li") {
			const last = lastClose[m.tag];
			if (last) last.end = m.start - 2n;
			lastClose[m.tag] = m;
		}
	}

	res.children.sort(sortChild);
	for (const t in lastClose) {
		lastClose[t].end = (res.children[res.children.length - 1] as Leaf).pos + 1n;
	}
	groupMarks(res, marks);
	// groupAdjacentWords(res);

	return res;
}

export async function fromBookLang(book: string, lang: string): Promise<Doc> {
	const docIds = await db.run<{ id: bigint }>(sql`
		SELECT
			id
		FROM
			scripture
			JOIN doc AS d ON d.id = doc
		WHERE book = '${book}' AND lang = '${lang}';
	`);

	if (!docIds.length)
		throw Error(
			t("Cannot find {book} in {lang}", {
				book,
				lang,
			}),
		);

	return fromDoc(docIds[0].id);
}
