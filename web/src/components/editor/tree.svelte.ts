import type { Doc as DocMeta, Word, Mark } from "@nerd-bible/schema";
import { db, sql } from "../../workers/dispatcher.svelte";
import { t } from "../../l10n.svelte";

type Rename<T, K extends keyof T, N extends string> = Pick<
	T,
	Exclude<keyof T, K>
> & { [P in N]: T[K] };

export type Child =
	| { pos: bigint; tag: "c"; data: number }
	| { pos: bigint; tag: "v"; data: number }
	| { pos: bigint; tag: "h"; level: number; text?: string }
	| { pos: bigint; tag: "pn"; doc: bigint }
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
	| { tag: "w"; pos: bigint; text?: string; lang?: string };

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

	const words = await db.run<
		Rename<Omit<Word, "doc">, "id", "pos"> & { tag: "w" }
	>(sql`
		SELECT
			'w' AS tag,
			id AS pos,
			lang,
			TEXT
		FROM word
		WHERE doc = ${id};
	`);
	res.children = words;

	const voidMarks = await db.run<{
		pos: bigint;
		tag: string;
		isBlob: boolean;
		data: any;
	}>(sql`
		SELECT
			start AS pos,
			tag,
			typeof(data) = 'blob' AS isBlob,
			iif(typeof(data) = 'blob', json(data), data) AS data
		FROM mark
		WHERE doc = ${id} AND tag IN ('c', 'v', 'h');
	`);
	for (const v of voidMarks) {
		res.children.push({
			pos: v.pos,
			tag: v.tag as any,
			data: v.isBlob ? JSON.parse(v.data) : v.data,
		});
	}

	const outline = await db.run<{ pos: bigint; level: string; text: string }>(
		sql`
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
		`,
	);
	res.children.push(...outline);

	res.children.sort(sortChild);

	console.log(res);
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
