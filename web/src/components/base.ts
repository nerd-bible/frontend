import { FluentBundle, FluentResource } from "@fluent/bundle";
import { effect, signal } from "alien-signals";
import { locale } from "../l10n";

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
type Signal<T> = ReturnType<typeof signal<T>>;

export function NbElement(
	id: string,
	html: string,
	css: string,
	l10n: {
		locale: string;
		ftl: Ftl;
		alternatives: Record<string, () => Promise<Ftl>>;
	},
) {
	style(css, id);
	const templ = template(html);

	return class extends HTMLElement {
		refs: Record<string, HTMLElement | SVGElement> = {};
		l10nBundle = signal(new FluentBundle(locale()));
		l10n: Record<string, Signal<() => string>> = {};

		constructor() {
			super();
			this.append(templ.cloneNode(true));

			effect(async () => {
				const newBundle = await this.generateBundle(locale());
				this.l10nBundle(newBundle);
			});

			const iterator = document.createNodeIterator(
				this,
				NodeFilter.SHOW_ELEMENT,
			);
			let node: Node | null;
			while ((node = iterator.nextNode())) {
				if (!(node instanceof HTMLElement) && !(node instanceof SVGElement)) continue;
				if (node.tagName.includes("-") && node.tagName !== this.tagName) continue;

				for (let i = 0; i < node.attributes.length; i++) {
					const attr = node.attributes.item(i)!;
					if (attr.name === ":ref") {
						this.refs[attr.value] = node;
						node.removeAttribute(attr.name);
					} else if (attr.name.startsWith("@")) {
						const eventName = attr.name.substring(1);
						const maybeFn = (this as any)[attr.value];
						if (typeof maybeFn !== "function") {
							console.error("cannot bind", eventName, "to", maybeFn);
						} else {
							node.addEventListener(eventName, maybeFn.bind(this));
						}
						node.removeAttribute(attr.name);
					} else if (attr.name.startsWith("$")) {
						const attrName = attr.name.substring(1);
						const attrValue = attr.value;

						(this as any)[attrValue] ??= signal<string>();

						const toBind = node;
						if (attrName.startsWith("l10n")) {
							const bindAttribute = attrName.startsWith("l10n:")
								? attrName.split(":").pop()!
								: "textContent";

							effect(() => {
								const bundle = this.l10nBundle();
								const message = bundle.getMessage(attrValue);
								const value = message?.value
									? bundle.formatPattern(message.value, {})
									: attrValue;
								if (bindAttribute === "textContent") toBind.textContent = value;
								else toBind.setAttribute(bindAttribute, value);
							});
						}

						node.removeAttribute(attr.name);
					}
				}
			}
		}

		async generateBundle(lang: string) {
			if (lang in l10n.alternatives) {
				const ftl = await l10n.alternatives[lang]();
				return makeBundle(lang, ftl);
			}
			return makeBundle(l10n.locale, l10n.ftl);
		}
	};
}
