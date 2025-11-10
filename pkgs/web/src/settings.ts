import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";

function createSetting<T>(name: string, defaultValue: T) {
	return makePersisted(createSignal(defaultValue), { name });
}

export const [theme, setTheme] = createSetting("theme", "system");
export const [fontSize, setFontSize] = createSetting("fontSize", "20px");
export const [columnWidth, setColumnWidth] = createSetting(
	"columnWidth",
	"600px",
);
