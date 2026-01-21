// We use Fluent because it's bundles allow translators to write concise
// programmatic strings. MessageFormat 2.0 was considered and rejected because
// it cannot handle compound messages which force some weird multi-message
// strings.
import { negotiateLanguages } from "@fluent/langneg";
import { effect, signal } from "alien-signals";

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
const defaultLocale = "en-US";

function persistentSignal(key: string, defaultValue = "") {
	const res = signal(localStorage.getItem(key) ?? defaultValue);
	effect(() => localStorage.setItem(key, res() ?? ""));
	return res;
}

// Bind it to quick settings input
export const locale = persistentSignal(
	"locale",
	negotiateLanguages(navigator.languages, Object.keys(locales), {
		strategy: "lookup",
		defaultLocale,
	})[0]!,
);
effect(() => (document.documentElement.lang = locale()));
