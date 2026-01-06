type Bindable = HTMLInputElement | HTMLSelectElement;

const bound: Record<
	string,
	{
		ele: Bindable;
		effect?: (v: string) => void;
	}
> = {};
const storage = localStorage;

export function bindSetting(
	name: string,
	defaultValue: string,
	effect?: (v: string) => void,
) {
	const ele = document.getElementById(name)! as Bindable;
	// Does NOT trigger listener
	const existing = storage.getItem(name);
	if (existing == null) storage.setItem(name, defaultValue);
	else ele.value = existing;

	effect?.(ele.value);
	bound[name] = { ele, effect };

	ele?.addEventListener("input", () => {
		storage.setItem(name, ele.value);
		effect?.(ele.value);
	});
}

window.addEventListener("storage", (event) => {
	const b = bound[event.key ?? ""];
	if (event.storageArea === storage && b && event.newValue != null) {
		b.ele.value = event.newValue;
		b.effect?.(event.newValue);
	}
});

bindSetting("theme", "system", (t) => (document.documentElement.className = t));
bindSetting(
	"fontSize",
	"20",
	(t) => (document.querySelector("main")!.style.fontSize = `${t}px`),
);
bindSetting(
	"columnWidth",
	"600",
	(t) => (document.querySelector("main")!.style.maxWidth = `${t}px`),
);
