// l10n == localization !
// We use Fluent because it's bundles allow translators to write concise
// programmatic strings. MessageFormat 2.0 was considered and rejected because
// it cannot handle compound messages which force some weird multi-message
// strings.
import { FluentBundle, FluentResource } from "@fluent/bundle";
import { DOMLocalization } from "@fluent/dom";
import { negotiateLanguages } from "@fluent/langneg";
import enUs from "../l10n/critical/en-US.ftl?raw";
import es from "../l10n/critical/es.ftl?raw";
import { bindSetting } from "./settings";

function makeBundle(locale: string, raw: string): FluentBundle {
	const bundle = new FluentBundle(locale);
	const resource = new FluentResource(raw);
	bundle.addResource(resource);
	return bundle;
}

const locales = {
	"en-US": {
		name: "English",
		critical: makeBundle("en-US", enUs),
		noncritical: () =>
			import("../l10n/noncritical/en-US.ftl?raw").then((r) =>
				makeBundle("en-US", r.default),
			),
	},
	// he: {
	// 	name: "עברית",
	// 	bundle: makeBundle("he", enUs),
	// },
	// el: "Ελληνικά",
	es: {
		name: "Español",
		critical: makeBundle("es", es),
		noncritical: () =>
			import("../l10n/noncritical/en-US.ftl?raw").then((r) =>
				makeBundle("es", r.default),
			),
	},
};
type Locale = keyof typeof locales;
const defaultLocale = "en-US";

const select = document.getElementById("locale")!;
for (const k in locales) {
	const opt = document.createElement("option");
	opt.value = k;
	opt.innerText = locales[k as Locale].name;
	select.appendChild(opt);
}

const l10n = new DOMLocalization(["critical.ftl", "noncritical.ftl"], function*() {});

bindSetting(
	"locale",
	negotiateLanguages(navigator.languages, Object.keys(locales), {
		strategy: "lookup",
		defaultLocale,
	})[0]!,
	(l) => {
		document.documentElement.lang = l;

		async function* generateBundles(): AsyncGenerator<FluentBundle> {
			const locale = locales[l as Locale] ?? locales[defaultLocale];
			yield locale.critical;
			yield await locale.noncritical();
		}
		l10n.generateBundles = generateBundles;
		l10n.disconnectRoot(document.documentElement);
		l10n.connectRoot(document.documentElement);
		l10n.onChange();
	},
);
