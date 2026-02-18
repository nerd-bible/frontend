import { negotiateLanguages } from "@fluent/langneg";
import locales from "./locales";

export type Locale = keyof typeof locales;
export type Theme = "system" | "dark" | "light";
const storage = localStorage;

// Add settings with their defaults here
const initial = {
	locale: negotiateLanguages(navigator.languages, Object.keys(locales), {
		strategy: "lookup",
		defaultLocale: "en-US",
	})[0]!,
	theme: "system",
	columnWidth: "600",
	fontSize: parseFloat(getComputedStyle(document.body).fontSize).toString(),
	lineHeightOffset: "1.2rem",
	textBlocking: "paragraph" as TextBlocking,
	chapterNumDisplay: "float" as ChapterNumDisplay,
	showVerseNum: "false",
	// TODO: sync these to DB (+ make reactive) instead of localStorage
	userHighlights: JSON.stringify({
		red: "background-color: rgb(155, 0, 0)",
		green: "background-color: rgb(0, 155, 0)",
	}),
} satisfies Record<string, string /** simple for localStorage */>;

// Source of truth
export const settings = $state(
	Object.entries(initial).reduce(
		(acc, [k, v]) => {
			(acc[k as keyof typeof initial] as string) = storage.getItem(k) ?? v;
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
			else storage.setItem(key, settings[key]);
		});
	}
	$effect(() => {
		document.documentElement.className = settings.theme;
	});
});

// Watch storage to react to other tabs changing
window.addEventListener("storage", (ev) => {
	if (ev.storageArea === storage && ev.key && ev.key in initial) {
		const k = ev.key as keyof typeof initial;
		(settings[k] as string) = ev.newValue ?? initial[k];
	}
});

// Misc constants
export { locales };
export const textBlockings = [
	"paragraph",
	"chapter",
	"verse",
	"sentence",
] as const;
export type TextBlocking = (typeof textBlockings)[number];
export const chapterNumDisplays = [
	"float",
	"normal",
	"small",
	"none",
] as const;
export type ChapterNumDisplay = (typeof chapterNumDisplays)[number];
