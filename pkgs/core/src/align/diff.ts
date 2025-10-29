/// Port of https://github.com/jonTrent/PatienceDiff (Unlicense)

function uniqueIndices(arr: string[], lo: number, hi: number) {
	const res = new Map<string, number /* index */>();
	const seen = new Set<string>();

	for (let i = lo; i <= hi; i++) {
		let token = arr[i]!;

		if (seen.has(token)) {
			res.delete(token);
		} else {
			seen.add(token);
			res.set(token, i);
		}
	}

	return res;
}

function uniqueCommon(
	aArray: string[],
	aLo: number,
	aHi: number,
	bArray: string[],
	bLo: number,
	bHi: number,
) {
	const uniqueA = uniqueIndices(aArray, aLo, aHi);
	const uniqueB = uniqueIndices(bArray, bLo, bHi);

	const res = new Map<string, { indexA: number; indexB: number }>();
	for (const [key, indexA] of uniqueA) {
		const indexB = uniqueB.get(key);
		if (indexB != null) res.set(key, { indexA, indexB });
	}
	return res;
}

function longestCommonSubsequence(ab: ReturnType<typeof uniqueCommon>) {
	type Position = { indexA: number; indexB: number };
	const res = [] as Array<Position & { previous?: Position }>;
	const subsequences = [] as Array<typeof res>;

	for (const [_, v] of ab) {
		let i = 0;
		while (subsequences.at(i)?.at(-1)?.indexB! < v.indexB) {
			i++;
		}
		subsequences[i] ??= [];
		subsequences[i]!.push({
			...v,
			previous: i > 0 ? subsequences.at(i - 1)?.at(-1) : undefined,
		});
	}
	if (subsequences.length) {
		res.push(subsequences.at(-1)!.at(-1)!);
		while (res.at(-1)!.previous) {
			res.push(res.at(-1)!.previous!);
		}
	}
	return res.reverse();
}

type Move<T> = { tokens: T[]; indices: number[] };
type Diff<T> = {
	tokens: {
		token: T;
		aIndex: number;
		bIndex: number;
		moved?: boolean;
	}[];
	deleted: number;
	inserted: number;
	aMove: Move<T>;
	bMove: Move<T>;
};

export function patienceDiff(aTokens: string[], bTokens: string[]) {
	const res: Diff<string> = {
		tokens: [],
		deleted: 0,
		inserted: 0,
		aMove: { tokens: [], indices: [] },
		bMove: { tokens: [], indices: [] },
	};

	function addToResult(aIndex: number, bIndex: number) {
		if (bIndex < 0) {
			res.aMove.tokens.push(aTokens[aIndex]!);
			res.aMove.indices.push(res.tokens.length);
			res.deleted++;
		} else if (aIndex < 0) {
			res.bMove.tokens.push(bTokens[bIndex]!);
			res.bMove.indices.push(res.tokens.length);
			res.inserted++;
		}

		res.tokens.push({
			token: 0 <= aIndex ? aTokens[aIndex]! : bTokens[bIndex]!,
			aIndex: aIndex,
			bIndex: bIndex,
		});
	}

	function addSubMatch(aLo: number, aHi: number, bLo: number, bHi: number) {
		while (aLo <= aHi && bLo <= bHi && aTokens[aLo] === bTokens[bLo]) {
			addToResult(aLo++, bLo++);
		}

		let aHiTemp = aHi;

		while (aLo <= aHi && bLo <= bHi && aTokens[aHi] === bTokens[bHi]) {
			aHi--;
			bHi--;
		}

		const uniqueCommonMap = uniqueCommon(aTokens, aLo, aHi, bTokens, bLo, bHi);

		if (uniqueCommonMap.size === 0) {
			while (aLo <= aHi) {
				addToResult(aLo++, -1);
			}

			while (bLo <= bHi) {
				addToResult(-1, bLo++);
			}
		} else {
			recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap);
		}

		while (aHi < aHiTemp) addToResult(++aHi, ++bHi);
	}

	function recurseLCS(
		aLo: number,
		aHi: number,
		bLo: number,
		bHi: number,
		uniqueCommonMap: ReturnType<typeof uniqueCommon> = uniqueCommon(
			aTokens,
			aLo,
			aHi,
			bTokens,
			bLo,
			bHi,
		),
	) {
		const x = longestCommonSubsequence(uniqueCommonMap);
		const first = x[0];

		if (!first) {
			addSubMatch(aLo, aHi, bLo, bHi);
		} else {
			if (aLo < first.indexA || bLo < first.indexB) {
				addSubMatch(aLo, first.indexA - 1, bLo, first.indexB - 1);
			}

			let i;
			for (i = 0; i < x.length - 1; i++) {
				addSubMatch(
					x[i]!.indexA,
					x[i + 1]!.indexA - 1,
					x[i]!.indexB,
					x[i + 1]!.indexB - 1,
				);
			}

			if (x[i]!.indexA <= aHi || x[i]!.indexB <= bHi) {
				addSubMatch(x[i]!.indexA, aHi, x[i]!.indexB, bHi);
			}
		}
	}

	recurseLCS(0, aTokens.length - 1, 0, bTokens.length - 1);

	return res;
}

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function patienceDiffPlus(aTokens: string[], bTokens: string[]) {
	const difference: WithOptional<
		ReturnType<typeof patienceDiff>,
		"aMove" | "bMove"
	> & { moved: number } = {
		...patienceDiff(aTokens, bTokens),
		moved: 0,
	};

	let aMoveNext = difference.aMove!;
	let bMoveNext = difference.bMove!;

	delete difference.aMove;
	delete difference.bMove;

	let lastLineCountMoved;

	do {
		let aMove = aMoveNext;
		let bMove = bMoveNext;

		aMoveNext = { tokens: [], indices: [] };
		bMoveNext = { tokens: [], indices: [] };

		let subDiff = patienceDiff(aMove.tokens, bMove.tokens);

		lastLineCountMoved = difference.moved;

		subDiff.tokens.forEach((v) => {
			if (0 <= v.aIndex && 0 <= v.bIndex) {
				difference.tokens[aMove.indices[v.aIndex]!]!.moved = true;
				difference.tokens[bMove.indices[v.bIndex]!]!.aIndex =
					aMove.indices[v.aIndex]!;
				difference.tokens[bMove.indices[v.bIndex]!]!.moved = true;
				difference.inserted--;
				difference.deleted--;
				difference.moved++;
			} else if (v.bIndex < 0) {
				aMoveNext.tokens.push(aMove.tokens[v.aIndex]!);
				aMoveNext.indices.push(aMove.indices[v.aIndex]!);
			} else {
				bMoveNext.tokens.push(bMove.tokens[v.bIndex]!);
				bMoveNext.indices.push(bMove.indices[v.bIndex]!);
			}
		});
	} while (0 < difference.moved - lastLineCountMoved);

	return difference;
}
