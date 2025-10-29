import { expect, test } from "bun:test";
import { details, fromEnglish } from "./book";

test("tricky books", () => {
	expect(fromEnglish("1 Samuel")).toBe("1sa");
	expect(fromEnglish("Esther")).toBe("est");
});

test("maps back to self", () => {
	for (const p of Object.keys(details)) {
		expect(fromEnglish(p) as string).toBe(p);
	}
});

test("some long names", () => {

	expect(fromEnglish("first letter of paul to the corinthians")).toBe("1co");
	expect(fromEnglish("second letter of paul to the corinthians")).toBe("2co");
});
