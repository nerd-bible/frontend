import { makePersisted } from "@solid-primitives/storage";
import { pickLocale } from "locale-matcher";
import { createSignal } from "solid-js";
import { locales } from "./i18n/locales";

function createSetting<T>(name: string, defaultValue: T) {
	return makePersisted(createSignal(defaultValue), { name });
}

export const [locale, setLocale] = createSetting(
	"locale",
	pickLocale(navigator.languages, locales, locales[0]),
);
export const [theme, setTheme] = createSetting("theme", "system");
export const [fontSize, setFontSize] = createSetting("fontSize", "20px");
export const [columnWidth, setColumnWidth] = createSetting(
	"columnWidth",
	"600px",
);
