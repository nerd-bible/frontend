export function debounce(cb: (...args: any[]) => any, t: number) {
	let timer: number;
	return (...args: any[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => cb(...args), t);
	};
}

export function spacing(multi = 1) {
	const computed = getComputedStyle(document.body);
	const remToPx = (rem: string) =>
		parseFloat(rem) * parseFloat(computed.fontSize);
	return remToPx(computed.getPropertyValue("--spacing-inc")) * multi;
}
