import { For, useContext } from "solid-js";
import { IntlCtx } from "../i18n";
import { setTheme, theme } from "../settings";

export function ThemePicker() {
	const t = useContext(IntlCtx);

	const options = {
		system: "icon-[mingcute--computer-line]",
		dark: "icon-[mingcute--moon-line]",
		light: "icon-[mingcute--sun-line]",
	};

	return (
		<div role="radiogroup" class="flex bg-bg-100 outline-2 rounded">
			<For each={Object.entries(options)}>
				{([k, v]) => (
					<label
						class="relative p-2 grow focus-within:ffocus"
						classList={{ "bg-primary": theme() === k }}
					>
						<input
							type="radio"
							name="theme"
							onInput={() => setTheme(k)}
							class="appearance-none"
						/>
						<span class={`${v} w-full h-full`} />
						<span class="sr-only">{t()(k as keyof typeof options)}</span>
					</label>
				)}
			</For>
		</div>
	);
}
