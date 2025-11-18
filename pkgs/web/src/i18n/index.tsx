import { createIntl, messages } from "@ccssmnn/intl";
import { makePersisted } from "@solid-primitives/storage";
import { pickLocale } from "locale-matcher";
import type { Accessor, Context } from "solid-js";
import { createContext, createEffect, createSignal, Show } from "solid-js";
import type { Translation } from "./generated/index";
import { getLocaleDir } from "messageformat/functions";

export const locales = ["en", "he", "el", "es"];
export const [locale, setLocale] = makePersisted(
	createSignal(pickLocale(navigator.languages, locales, locales[0])),
	{ name: "locale" },
);

type IntlFn = ReturnType<typeof createIntl<Translation>>;
type T = Accessor<IntlFn>;
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

	createEffect(() => {
		document.documentElement.lang = locale();
		document.documentElement.dir = getLocaleDir(locale());
	});

	return (
		<Show when={intl()} fallback="loading translation...">
			<IntlCtx.Provider value={intl as () => IntlFn}>
				{props.children}
			</IntlCtx.Provider>
		</Show>
	);
}
