import { makePersisted } from "@solid-primitives/storage";
import { createEffect, createSignal, For } from "solid-js";

export const [theme, setTheme] = makePersisted(createSignal("system"), {
	name: "theme",
});

export function ThemePicker() {
	const options = {
		system: "icon-[mingcute--computer-line]",
		dark: "icon-[mingcute--moon-line]",
		light: "icon-[mingcute--sun-line]",
	};
	createEffect(() => (document.documentElement.className = theme()));

	return (
		<div class="flex gap-2">
			<For each={Object.entries(options)}>
				{([k, v]) => (
					<button
						class="grow"
						type="button"
						onClick={() => setTheme(k)}
						classList={{ selected: theme() === k }}
					>
						<span class={`${v} m-auto`} />
					</button>
				)}
			</For>
		</div>
	);
}
