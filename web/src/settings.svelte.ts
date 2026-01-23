export const locales = {
	"en-US": {
		name: "English",
	},
	// he: {
	// 	name: "עברית",
	// },
	// el: "Ελληνικά",
	es: {
		name: "Español",
	},
};
export type Locale = keyof typeof locales;
export type Theme = "system" | "dark" | "light";

// Add settings here
const initial = {
	locale: "en-US" as Locale,
	theme: "system" as Theme,
	columnWidth: "600",
	fontSize: "16",
};
for (const k in initial) {
	const key = k as keyof typeof initial;
	(initial[key] as string) = localStorage.getItem(k) ?? initial[key];
}
const settings = $state(initial);
export default settings;

$effect.root(() => {
	for (const k in initial) {
		const key = k as keyof typeof initial;
		$effect(() => localStorage.setItem(key, settings[key]));
	}
	$effect(() => {
		document.querySelector("main")!.style.maxWidth = `${settings.columnWidth}px`;
		document.querySelector("main")!.style.fontSize = `${settings.fontSize}px`;
		document.documentElement.className = settings.theme;
	});
});
