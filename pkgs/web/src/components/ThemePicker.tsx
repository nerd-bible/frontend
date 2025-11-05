import { makePersisted } from "@solid-primitives/storage";
import { createEffect, createSignal, For } from "solid-js";

export const [theme, setTheme] = makePersisted(createSignal("system"), { name: "theme" });

export function ThemePicker() {
	const options = {
		system: "icon-[mingcute--computer-line]",
		dark: "icon-[mingcute--moon-line]",
		light: "icon-[mingcute--sun-line]",
	};
	createEffect(() => (document.documentElement.className = theme()));

	return (
		<For each={Object.entries(options)}>
			{([k, v]) => (
				<button
					type="button"
					onClick={() => setTheme(k)}
					classList={{
						"border p-2 bg-bg": true,
						selected: theme() === k,
					}}
				>
					<span class={v} />
				</button>
			)}
		</For>
	);
}
