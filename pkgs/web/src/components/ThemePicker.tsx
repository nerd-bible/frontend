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
		<div class="flex flex-nowrap items-center w-64">
			<span class="mx-2 icon-[mingcute--paint-brush-line]" />
			<span class="grow">Theme</span>
			<For each={entries}>
				{([k, v]) => (
					<button
						type="button"
						onClick={() => setTheme(k)}
						classList={{
							"border text-xs leading-none p-1 bg-bg": true,
							selected: theme() === k,
						}}
					>
						<span class={v} />
					</button>
				)}
			</For>
		</div>
	);
}
