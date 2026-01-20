import { FluentBundle, FluentResource } from "@fluent/bundle";
import { DOMLocalization } from "@fluent/dom";

function makeBundle(locale: string, ftl: string): FluentBundle {
	const bundle = new FluentBundle(locale);
	const resource = new FluentResource(ftl);
	bundle.addResource(resource);
	return bundle;
}

function style(css: string, id?: string) {
	const style = document.createElement("style");
	style.innerHTML = css;
	if (id) style.id = id;
	document.head.append(style);
}

interface Template {
	cloneNode(subtree?: boolean): Node;
}

function template(html: string): Template {
	const template = document.createElement("template");
	template.innerHTML = html;
	return template.content;
}

type Ftl = string;

export function NbElement(
	id: string,
	html: string,
	css: string,
	l10n: {
		locale: string,
		ftl: Ftl,
		alternatives: Record<string, () => Promise<Ftl>>,
	},
) {
	style(css, id);
	const templ = template(html);
	console.log(l10n);

	return class extends HTMLElement {
		constructor() {
			super();
			this.append(templ.cloneNode(true));
			const dom = new DOMLocalization([`${id}.ftl`], this.generateBundle.bind(this));
			dom.connectRoot(this);
			dom.translateRoots();
		}

		async* generateBundle() {
			const { lang } = document.documentElement;
			if (lang in l10n.alternatives) {
				const ftl = await l10n.alternatives[lang]();
				console.log("FTL", ftl);
				yield makeBundle(lang, ftl);
			} else {
				yield makeBundle(l10n.locale, l10n.ftl);
			}
		}
	};
}
