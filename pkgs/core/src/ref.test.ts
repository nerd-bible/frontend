import { expect, test } from "bun:test";
import { parseBcvPartOrWord } from "./ref";

test("basic ref", () => {
	expect(parseBcvPartOrWord("co")).toEqual({ book: "col" });
	expect(parseBcvPartOrWord("1 corinthians")).toEqual({ book: "1co" });
	expect(parseBcvPartOrWord("1cor")).toEqual({ book: "1co" });
	expect(parseBcvPartOrWord("1cor2")).toEqual({ book: "1co", chapter: 2 });
	expect(parseBcvPartOrWord("1cor2:a")).toEqual({ book: "1co", chapter: 2 });
	expect(parseBcvPartOrWord("1cor2:3")).toEqual({ book: "1co", chapter: 2, verse: 3 });
	expect(parseBcvPartOrWord("1cor2:3a")).toEqual({
		book: "1co",
		chapter: 2,
		verse: 3,
		part: "a",
	});
	expect(parseBcvPartOrWord("1cor2:3#4")).toEqual({
		book: "1co",
		chapter: 2,
		verse: 3,
		word: 4,
	});
});

test("weird delimiters", () => {
	expect(parseBcvPartOrWord("1cor:2")).toEqual({ book: "1co", chapter: 2 });
	expect(parseBcvPartOrWord("1cor2::3")).toEqual({ book: "1co", chapter: 2, verse: 3 });
	expect(parseBcvPartOrWord("1 cor 2 : 3")).toEqual({
		book: "1co",
		chapter: 2,
		verse: 3,
	});
	expect(parseBcvPartOrWord("1 cor_2 _ 3")).toEqual({
		book: "1co",
		chapter: 2,
		verse: 3,
	});

	expect(parseBcvPartOrWord("1cor     2    :    3     #      4")).toEqual({
		book: "1co",
		chapter: 2,
		verse: 3,
		word: 4,
	});
	expect(parseBcvPartOrWord("1cor2v3 wwwww 4")).toEqual({
		book: "1co",
		chapter: 2,
		verse: 3,
		word: 4,
	});
	expect(parseBcvPartOrWord("1cor2 verse 3 word 4")).toEqual({
		book: "1co",
		chapter: 2,
		verse: 3,
		word: 4,
	});
});
