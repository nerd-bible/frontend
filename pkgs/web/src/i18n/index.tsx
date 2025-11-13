import { createIntl, messages } from "@ccssmnn/intl";
// import { LocaleMatcher } from "@phensley/locale-matcher";
import { makePersisted } from "@solid-primitives/storage";
import { pickLocale } from "locale-matcher";
import { getLocaleDir } from "messageformat/functions";
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

export const locales = ["en", "he", "el", "es"];
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
		const req = await fetch(`/i18n/generated/${l}.json`);
		const strings: Translation = await req.json();
		const msgs = messages(strings);
		const nextIntl: IntlFn = createIntl(msgs, l);
		setIntl(() => nextIntl);
	});

	// Yes, this makes a memo for every localized string for convenience.
	const memoized = (key: string, ...args: any) =>
		createMemo(() => {
			try {
				return (intl() as any)(key, ...args);
			} catch {
				return key;
			}
		});

	return (
		<Show when={intl()} fallback="loading translation...">
			<div lang={locale()} dir={getLocaleDir(locale())}>
				<IntlCtx.Provider value={memoized}>{props.children}</IntlCtx.Provider>
			</div>
		</Show>
	);
}
