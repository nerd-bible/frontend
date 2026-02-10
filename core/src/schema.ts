// https://duckdb.org/docs/stable/sql/data_types/overview
export const document = `create table document (
	lang string,
	book string,
	id string,
	primary key(lang, book, id),

	name string,
	published date,
	publishedErrorRangeDays uinteger
)`;

export const sentence = `create table sentence (
	documentLang string,
	documentBook string,
	documentId string,
	id usmallint,
	primary key(documentLang, documentBook, documentId, id),

	misc map(string, string),
	position usmallint
)`;

export const word = `create table word (
	documentLang string,
	documentBook string,
	documentId string,
	sentenceId usmallint,
	id usmallint,
	primary key(documentLang, documentBook, documentId, sentenceId, id),

	type string,
	form string,
	lemma string,
	upos string,
	xpos string,
	feats map(string, string),
	head usmallint,
	deprel string,
	deps map(string, string),
	misc map(string, string),

	chapter usmallint,
	verse string
)`;
