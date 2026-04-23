export function bsearch<T, U extends bigint | number>(
	arr: T[],
	target: U,
	getN: (e: T) => U,
): number {
	let low = 0;
	let high = arr.length - 1;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const val = getN(arr[mid]);

		if (val === target) return mid;
		else if (val < target) low = mid + 1;
		else high = mid - 1;
	}
	return -1;
}
