import { db, sql } from "../../workers/dispatcher.svelte";
import { t } from "../../l10n.svelte";
import * as T from "./tree.ts";

export async function docFromId(id: bigint) {
	const docMeta = await db.run<{
		lang: string;
		createdAt: number;
		title: string;
	}>(sql`
		SELECT lang, createdAt, title
		FROM doc
		WHERE id = ${id};
	`);
	if (!docMeta.length) throw Error(t("No doc with id {}", { id }));

	const { lang, title, createdAt } = docMeta[0];
	const res = new T.Doc({
		id,
		lang,
		title,
		createdAt: createdAt ? new Date(createdAt * 1000) : undefined,
	});

	const words = await db.run<{
		pos: bigint;
		lang: string;
		text: string;
	}>(sql`
		SELECT
			id AS pos,
			lang,
			text
		FROM word
		WHERE doc = ${id};
	`);
	res.children.push(...words.map((w) => new T.Word(w.pos, w.text, w.lang)));

	const voidMarks = await db.run<{
		pos: bigint;
		tag: "c" | "v";
		number: number;
	}>(sql`
		SELECT
			start AS pos,
			tag,
			data AS number
		FROM mark
		WHERE doc = ${id} AND tag IN ('c', 'v')
		ORDER BY tag;
	`);
	for (const m of voidMarks) {
		res.children.push(
			m.tag === "c"
				? new T.Chapter(m.pos, m.number)
				: new T.Verse(m.pos, m.number),
		);
	}

	const outline = await db.run<{
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
			(SELECT pos FROM cv WHERE c = chapter AND v = verse) AS pos,
			level,
			text
		FROM outline
		WHERE doc = (SELECT doc FROM cv LIMIT 1);
	`);
	res.children.push(...outline.map(o => new T.Outline(o.pos, o.level, o.text)));

	type Mark = {
		start: bigint;
		end: bigint;
		tag: "p" | "q" | "em" | "strong" | "ref";
		data: string;
	};
	const marks = await db.run<Mark>(sql`
		SELECT
			start,
			end,
			tag,
			json(data) AS data
		FROM mark
		WHERE doc = ${id} AND tag IN ('p', 'q', 'em', 'strong', 'ref')
		ORDER BY end - start, tag;
	`);
	const lastClose: Record<string, Mark> = {};
	for (const m of marks) {
		m.data = JSON.parse(m.data);
		if (m.tag === "p") {
			const last = lastClose[m.tag];
			if (last) last.end = m.start - 2n;
			lastClose[m.tag] = m;
		}
	}

	res.sort();
	for (const t in lastClose) {
		lastClose[t].end = res.children[res.children.length - 1].pos + 1n;
	}
	// groupMarks(res, marks);
	// groupAdjacentWords(res);

	console.log(res);
	return res;
}

export async function docFromBookLang(book: string, lang: string) {
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

	return docFromId(docIds[0].id);
}
