import { createIntl as createIntl2, messages } from "@ccssmnn/intl";
import { makePersisted } from "@solid-primitives/storage";
import { createMemo, createSignal } from "solid-js";

export const [locale, setLocale] = makePersisted(
	createSignal("en" /* TODO: fix */),
	{ name: "locale" }
);

export function createIntl<const T extends Record<string, string>>(
	msgs: Parameters<typeof messages<T>>[0],
): ReturnType<typeof createIntl2<T>> {
	const intl = createMemo(() => createIntl2(messages(msgs), locale()));
	return intl();
}

// TODO: remove dir once FF supports Intl.Locale.getTextInfo
// https://bugzilla.mozilla.org/show_bug.cgi?id=1693576
export const langs = {
	en: {
	},
	he: {
		dir: "rtl",
	},
	el: {
	},
};
