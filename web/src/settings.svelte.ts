import { negotiateLanguages } from "@fluent/langneg";
import locales from "./locales";

export type Locale = keyof typeof locales;
export type Theme = "system" | "dark" | "light";

// Add settings here
const initial = {
	locale: negotiateLanguages(navigator.languages, Object.keys(locales), {
		strategy: "lookup",
		defaultLocale: "en-US",
	})[0]! as Locale,
	theme: "system" as Theme,
	columnWidth: "600",
	fontSize: "16",
	textBlocking: "paragraph",
};
for (const k in initial) {
	const key = k as keyof typeof initial;
	(initial[key] as string) = localStorage.getItem(k) ?? initial[key];
}
export const settings = $state(initial);
export { locales };
export const textBlockings = [
	"paragraph",
	"chapter",
	"verse",
	"sentence",
] as const;
export type TextBlockings = typeof textBlockings[number];

$effect.root(() => {
	for (const k in initial) {
		const key = k as keyof typeof initial;
		$effect(() => localStorage.setItem(key, settings[key]));
	}
	$effect(() => {
		document.documentElement.className = settings.theme;
	});
});
