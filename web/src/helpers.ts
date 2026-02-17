export function debounce(cb: (...args: any[]) => any, t: number) {
	let timer: number;
	return (...args: any[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => cb(...args), t);
	};
}
