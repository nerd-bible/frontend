// This file is imported in every .svelte file that has <l10n> tags by
// vite-plugin-l10n in order to bind the $state and $effects to the component.

// We use Fluent because it's bundles allow translators to write concise
// programmatic strings. MessageFormat 2.0 was considered and rejected because
// it cannot handle compound messages which force some weird multi-message
// strings.
import {
	FluentBundle,
	FluentResource,
	type FluentVariable,
} from "@fluent/bundle";
import { settings } from "./settings.svelte";

// Fluent file
type Ftl = string;
type Bundle = {
	locale: string;
	ftl: Ftl;
};

type L10n = {
	default: Bundle;
	other: Record<string, () => Promise<Ftl>>;
};

export function makeBundle(b: Bundle): FluentBundle {
	const bundle = new FluentBundle(b.locale);
	const resource = new FluentResource(b.ftl);
	const errors = bundle.addResource(resource);
	for (const e of errors) console.warn(e);

	return bundle;
}

export async function loadBundle(l10n: L10n, locale: string) {
	const ftl = await l10n.other[locale]();
	return makeBundle({ locale: locale, ftl });
}

export function makeT(l10n: L10n) {
	const defaultBundle = makeBundle(l10n.default);
	let bundle = $state(defaultBundle);
	$effect(() => {
		const newLocale = settings.locale;
		if (newLocale === l10n.default.locale) {
			bundle = defaultBundle;
		} else if (bundle.locales[0] !== newLocale && newLocale in l10n.other) {
			loadBundle(l10n, newLocale).then((b) => (bundle = b));
		}
	});

	return (msg: string, args?: Record<string, FluentVariable> | null) => {
		const message = bundle.getMessage(msg);
		return message?.value ? bundle.formatPattern(message.value, args) : msg;
	};
}
