export function bsearch<T, U extends bigint | number>(
	arr: T[],
	target: U,
	getN: (e: T) => U,
	seek?: "start" | "end",
): number {
	let low = 0;
	let high = arr.length - 1;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const val = getN(arr[mid]);

		if (val === target) {
			low = mid;
			break;
		} else if (val < target) low = mid + 1;
		else high = mid - 1;
	}

	if (seek === "start") {
		while (low > 0 && getN(arr[low]) === target) low--;
	}
	else if (seek === "end") {
		while (low < arr.length && getN(arr[low]) === target) low++;
	}

	return low;
}
