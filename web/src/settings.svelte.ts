import { negotiateLanguages } from "@fluent/langneg";
import locales from "./locales";

export type Locale = keyof typeof locales;
export type Theme = "system" | "dark" | "light";
const storage = localStorage;

// Add settings with their defaults here
export const initial = {
	locale: negotiateLanguages(navigator.languages, Object.keys(locales), {
		strategy: "lookup",
		defaultLocale: locales[0],
	})[0]!,
	theme: "System",
	// Reader settings
	columnWidth: "600",
	fontSize: parseFloat(getComputedStyle(document.body).fontSize).toString(),
	lineHeightOffset: "1.2rem",
	chapterNumDisplay: "Float",
	showVerseNum: "false",
	showFootnotes: "false",
};
export const length = $state({ n: storage.length });

function safeParse(s?: string | null): any {
	if (!s) return;

	try {
		return JSON.parse(s);
	} catch {
		return;
	}
}

// Source of truth
export const settings = $state(
	Object.entries(initial).reduce(
		(acc, [k, v]) => {
			(acc[k as keyof typeof initial] as string) =
				safeParse(storage.getItem(k)) ?? v;
			return acc;
		},
		{} as typeof initial,
	),
);

// Persist
$effect.root(() => {
	for (const k in initial) {
		const key = k as keyof typeof initial;
		$effect(() => {
			if (settings[key] === initial[key]) storage.removeItem(key);
			else storage.setItem(key, JSON.stringify(settings[key]));
			length.n = storage.length;
		});
	}
	$effect(() => {
		document.documentElement.className = settings.theme.toLowerCase();
	});
});

export function reset() {
	for (const k in initial) {
		// @ts-ignore
		settings[k] = initial[k];
	}
	storage.clear();
	length.n = storage.length;
}

// Watch storage to react to other tabs changing
window.addEventListener("storage", (ev) => {
	if (ev.storageArea === storage) {
		if (ev.key && ev.key in initial) {
			const k = ev.key as keyof typeof initial;
			(settings[k] as string) = safeParse(ev.newValue) ?? initial[k];
		} else reset();
		length.n = storage.length;
	}
});

// Misc constants
export { locales };
export const themes = ["System", "Dark", "Light"] as const;
export const chapterNumDisplays = ["Float", "Normal", "Small", "None"] as const;
export type ChapterNumDisplay = (typeof chapterNumDisplays)[number];
