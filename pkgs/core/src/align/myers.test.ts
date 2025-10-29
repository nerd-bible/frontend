import { expect, test } from "bun:test";
import { applyPatch, calcPatch } from "fast-myers-diff";

test("basic diff", () => {
	const e = "abc";
	const f = "bd";
	const patch = [...calcPatch(e, f)];
	expect(patch).toEqual([
		[0, 1, "", 0],
		[2, 3, "d", 2],
	] as any);
	expect([...applyPatch(e, patch)].join("")).toEqual(f);
});
