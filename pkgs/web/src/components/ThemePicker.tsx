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
		<div class="gap-4 flex flex-nowrap">
			<legend>
				<span class="icon-[mingcute--paint-brush-line]" />
				Theme
			</legend>
			<For each={entries}>
				{([k, v]) => (
					<label class="not-last:pr-4 not-last:border-r-2 inline-block">
						<input
							class="appearance-none"
							type="radio"
							name="theme"
							value={k}
							checked={theme() === k}
							onChange={() => setTheme(k)}
						/>
						<span
							classList={{
								"button": true,
								selected: theme() === k,
							}}
						>
							<span class={v} />
						</span>
					</label>
				)}
			</For>
		</div>
	);
}
