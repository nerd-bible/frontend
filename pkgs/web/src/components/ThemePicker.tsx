import { For, useContext } from "solid-js";
import { IntlCtx } from "../i18n";
import { setTheme, theme } from "../settings";

export function ThemePicker() {
	const t = useContext(IntlCtx);

	const options = {
		System: "icon-[mingcute--computer-line]",
		Dark: "icon-[mingcute--moon-line]",
		Light: "icon-[mingcute--sun-line]",
	};

	return (
		<div role="radiogroup" class="flex gap-2">
			<For each={Object.entries(options)}>
				{([k, v]) => (
					<label class="grow button" classList={{ selected: theme() === k }}>
						<input
							type="radio"
							name="theme"
							onInput={() => setTheme(k)}
							class="appearance-none"
						/>
						<span class={`${v} m-auto`} />
						<span class="sr-only">{t()(k as keyof typeof options)}</span>
					</label>
				)}
			</For>
		</div>
	);
}
