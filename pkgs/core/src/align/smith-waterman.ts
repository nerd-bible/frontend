// Finds singular best alignment of a `needle` in a `haystack` given:
// - fn similarity(needleEle, haystackEle): number
// - fn gapPenalty
//
// Start as naive [Smith Waterman](
// https://en.wikipedia.org/wiki/Smith%E2%80%93Waterman_algorithm
// ) with a linear gap penalty.
//
// Eventually add optimizations and an affine gap penalty.

export function score<T>(
	needle: T[],
	haystack: T[],
	similarity: (needleEle: T, haystackEle: T) => number,
	gapPenalty = 2,
): number[][] {
	const res = Array.from({ length: needle.length + 1}, () =>
		Array(haystack.length + 1).fill(0),
	);

	for (let i = 1; i <= needle.length; i++) {
		for (let j = 1; j <= haystack.length; j++) {
			res[i][j] = Math.max(
				res[i - 1][j - 1] + similarity(needle[i - 1], haystack[j - 1]),
				res[i][j - 1] - gapPenalty,
				res[i - 1][j] - gapPenalty,
				0,
			);
		}
	}

	return res;
}

const needle = "GGTTGACTA".split("");
const haystack = "TGTTACGG".split("");
const mat = score(needle, haystack, (a, b) => (a === b ? 3 : -3));

function fmtCell(n: number | string) {
	return n.toString().padStart(2, " ");
}

console.log(["",""].concat(haystack).map(fmtCell).join(" "));
for (let i = 0; i < mat.length; i++) {
	const row = mat[i];
	console.log(([needle[i - 1] ?? " "] as Array<string|number>).concat(row).map(fmtCell).join(" "));
}
