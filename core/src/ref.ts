import * as Book from "./book.ts";

export type Chapter = number;
export type Verse = string;
export type Part =
	| "a"
	| "b"
	| "c"
	| "d"
	| "e"
	| "f"
	| "g"
	| "h"
	| "i"
	| "j"
	| "k"
	| "l"
	| "m"
	| "n"
	| "o"
	| "p"
	| "q"
	| "r"
	| "s"
	| "t"
	| "u"
	| "v";
export type Word = number;

type C = { chapter: Chapter };
export type Cv = C & { verse?: Verse };
export type CvPart = Required<Cv> & { part?: Part };
export type CvWord = Required<Cv> & { word?: Word };

type B = { book: Book.Id };
export type Bc = B & Partial<C>;
export type Bcv = B & Cv;
export type BcvPart = B & CvPart;
export type BcvWord = B & CvWord;

const delimiter = "\\p{P}\\s";
const regexes = {
	book: `([^${delimiter}]{2,})`,
	chapter: `[${delimiter}]*(\\d+)`,
	verse: `(?:(?:[${delimiter}v]+|\\s*verse\\s*)(\\d+))`,
	part: "([a-v])",
	word: `(?:(?:[${delimiter}w]+|\\s*word\\s*)(\\d+))`,
};

// book (chapter (verse (part|word)?)?)?
const bcvPartOrWord = new RegExp(
	`${regexes.book}(?:(?:${regexes.chapter}${regexes.verse}?)(?:${regexes.part}|${regexes.word})?)?`,
	'u'
);
export function parseBcvPartOrWord(
	r: string,
): B | Bc | Bcv | BcvPart | BcvWord | undefined {
	const match = r.match(bcvPartOrWord);
	if (!match) return;

	const res: any = {};

	try {
		res.book = Book.fromEnglish(match[1]);
	} catch {
		return undefined;
	}

	if (match[2]) res.chapter = +match[2];
	if (match[3]) res.verse = match[3];
	// assert(!(match[4] && match[5]));
	if (match[4]) res.part = match[4];
	if (match[5]) res.word = +match[5];

	return res;
}

// chapter verse (part|word)?
const cvPartOrWord = new RegExp(
	`${regexes.chapter}${regexes.verse}(?:${regexes.part}|${regexes.word})?`,
	'u'
);
export function parseCv(r: string): Cv | CvPart | CvWord | undefined {
	const match = r.match(cvPartOrWord);
	if (!match) return;

	const res: any = {};

	if (match[1]) res.chapter = +match[1];
	if (match[2]) res.verse = match[2];
	// assert(!(match[3] && match[4]));
	if (match[3]) res.part = match[3];
	if (match[4]) res.word = +match[4];

	return res;
}

// TODO: range and groups
// type Range<T> = { from: T, to: T };
// 1cor 3:15-45
// 1cor 3:15a-45b
// 1cor3,9,12
// 1cor3:4,5,6
// 1cor3:4,5:5,6:1b
// 1cor 3-4
// 1cor3:4-9,12-15
// 1cor3:15#1-:14#5
// 1cor3-2cor4
