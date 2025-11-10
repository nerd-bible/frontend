import { createIntl, messages } from "@ccssmnn/intl";
// import { LocaleMatcher } from "@phensley/locale-matcher";
import { makePersisted } from "@solid-primitives/storage";
import { pickLocale } from "locale-matcher";
import {
	type Accessor,
	type Context,
	createContext,
	createEffect,
	createMemo,
	createSignal,
	Show,
} from "solid-js";
import type { Translation } from "./generated/index";

// https://vite.dev/guide/features#glob-import
export const modules = import.meta.glob<false, "string", Translation>(
	"./generated/*.json",
	{ import: "default" },
);
export const locales = ["en", "he", "el", "es"];
// TODO: remove dir once FF supports Intl.Locale.getTextInfo
// https://bugzilla.mozilla.org/show_bug.cgi?id=1693576
export const rtl = new Set(["he"]);
export const [locale, setLocale] = makePersisted(
	createSignal(pickLocale(navigator.languages, locales, locales[0])),
	{ name: "locale" },
);

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
	...a: Parameters<T>
) => TNewReturn;
type IntlFn = ReturnType<typeof createIntl<Translation>>;
type T = ReplaceReturnType<IntlFn, Accessor<string>>;

export const IntlCtx: Context<T> = createContext(undefined as any);

export function IntlProvider(props: { children: any }) {
	const [intl, setIntl] = createSignal<IntlFn>();
	createEffect(async () => {
		const l = locale();
		const strings = await modules[`./generated/${l}.json`]();
		const msgs = messages(strings);
		const nextIntl: IntlFn = createIntl(msgs, l);
		setIntl(() => nextIntl);
		document.documentElement.lang = l;
		document.documentElement.dir = rtl.has(l) ? "rtl" : "ltr";
	});

	const memoized = (key: string, ...args: any) =>
		createMemo(() => (intl() as any)(key, ...args));

	return (
		<Show when={intl()} fallback="loading translation...">
			<IntlCtx.Provider value={memoized}>{props.children}</IntlCtx.Provider>
		</Show>
	);
}
