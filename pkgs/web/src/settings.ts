import { pickLocale } from "locale-matcher";

type Bindable = HTMLInputElement | HTMLSelectElement;

const boundEles: Record<string, Bindable> = {};
const storage = localStorage;

function bindSetting<T extends string>(name: string, defaultValue: T) {
	const ele = document.getElementById(name)! as Bindable;
	if (storage[name] == null) storage.setItem(name, defaultValue);
	boundEles[name] = ele;

	ele?.addEventListener("change", () => storage.setItem(name, ele.value));
}

window.addEventListener("storage", (event) => {
	console.log("storage", event);
	const boundEle = boundEles[event.key ?? ""];
	if (event.storageArea === storage && boundEle && event.newValue != null) {
		boundEle.value = event.newValue;
	}
});

const locales = [];
const children = document.getElementById("lang")!.children;
for (let i = 0; i < children.length; i++) {
	locales.push(children.item(i)!.value);
}
console.log(locales);

bindSetting("locale", pickLocale(navigator.languages, locales, locales[0]));
bindSetting("theme", "system");
bindSetting("fontSize", "20px");
bindSetting("columnWidth", "600px");
