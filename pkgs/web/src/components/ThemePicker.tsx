import { makePersisted } from "@solid-primitives/storage";
import { createEffect, createSignal, For } from "solid-js";

const [theme, setTheme] = makePersisted(createSignal("system"));
createEffect(() => (document.documentElement.className = theme()));

export function ThemePicker() {
	const options = {
		system: "icon-[mingcute--settings-5-line]",
		dark: "icon-[mingcute--moon-line]",
		light: "icon-[mingcute--sun-line]",
	};
	const entries = Object.entries(options);

	return (
		<For each={entries}>
			{([k, v]) => (
				<button
					type="button"
					onClick={() => setTheme(k)}
					classList={{
						"border p-2": true,
						selected: theme() === k,
					}}
				>
					<span class={v} />
				</button>
			)}
		</For>
	);
}
