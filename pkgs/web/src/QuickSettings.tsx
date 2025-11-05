import { For } from "solid-js";
import { ThemePicker } from "./components/ThemePicker";
import { createIntl, locale, setLocale } from "./i18n";

type DropdownProps = {
	children?: any;
	icon: string;
	label: string;
	href: string;
};
function DropdownItem(props: DropdownProps) {
	return (
		<li class="flex hover:bg-mix-[darken/10]">
			<a href={props.href} class="p-2 leading-none flex items-center grow">
				<span class={`mx-2 ${props.icon}`} />
				<span>{props.label}</span>
			</a>
			{props.children}
		</li>
	);
}

export function QuickSettings() {
	const t = createIntl({
		theme: "Theme",
		settings: "Settings",
		language: "Language",
	});

	return (
		<ul class="flex flex-col w-86 select-none">
			<DropdownItem
				icon="icon-[mingcute--paint-brush-line]"
				href="/settings/theme"
				label={t("theme")}
			>
				<ThemePicker />
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--globe-line]"
				href="/settings#language"
				label={t("language")}
			>
				<select value={locale()} onChange={(ev) => setLocale(ev.target.value)}>
					<For each={["en", "he", "el"] as const}>
						{(o) => (
							<option value={o}>
								{new Intl.DisplayNames(locale(), { type: "language" }).of(o)}
							</option>
						)}
					</For>
				</select>
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--settings-5-line]"
				href="/settings"
				label={t("settings")}
			/>
		</ul>
	);
}
