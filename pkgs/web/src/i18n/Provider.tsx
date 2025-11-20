import { createIntl, messages } from "@ccssmnn/intl";
import { getLocaleDir } from "messageformat/functions";
import type { Accessor, Context } from "solid-js";
import { createContext, createEffect, createSignal, Show } from "solid-js";
import { locale } from "../settings";
import type { Translation } from "./generated/index";

type IntlFn = ReturnType<typeof createIntl<Translation>>;
type T = Accessor<IntlFn>;
export const I18nCtx: Context<T> = createContext(undefined as any);

export function I18nProvider(props: { children: any }) {
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
			<I18nCtx.Provider value={intl as () => IntlFn}>
				{props.children}
			</I18nCtx.Provider>
		</Show>
	);
}
