import { For } from "solid-js";
import { version } from "../package.json";
import { ThemePicker } from "./components/ThemePicker";
import { createIntl, langs, locale, setLocale } from "./i18n";

type DropdownProps = {
	children?: any;
	icon: string;
	label: string;
	href: string;
};
function DropdownItem(props: DropdownProps) {
	return (
		<li class="grid grid-cols-subgrid col-span-2 hover:bg-fg/10 pe-4">
			<a href={props.href} class="flex p-4 gap-2 items-center">
				<span class={props.icon} />
				<span>{props.label}</span>
			</a>
			{props.children}
		</li>
	);
}

export function QuickSettings() {
	const t = createIntl({
		Theme: "Theme",
		Language: "Language",
		Settings: "Settings",
		"Font size": "Font size",
	});

	return (
		<ul class="grid grid-cols-[minmax(0,1fr)_1fr] w-86 select-none my-4">
			<DropdownItem
				icon="icon-[mingcute--paint-brush-line] scale-x-[-1]"
				href="/settings/theme"
				label={t("Theme")}
			>
				<ThemePicker />
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--font-size-line]"
				href="/settings/theme"
				label={t("Font size")}
			>
				<input
					name="fontSize"
					class="w-42"
					type="range"
					min={8}
					max={48}
					value="20"
					onChange={(ev) =>
						document.documentElement.style.setProperty(
							"--font-size",
							`${ev.target.value}px`,
						)
					}
				/>
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--globe-line]"
				href="/settings#language"
				label={t("Language")}
			>
				<select
					name="language"
					class="ps-2"
					value={locale()}
					onChange={(ev) => setLocale(ev.target.value)}
				>
					<For each={Object.keys(langs)}>
						{(o) => (
							<option value={o}>
								{new Intl.DisplayNames(o, { type: "language" }).of(o)}
							</option>
						)}
					</For>
				</select>
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--settings-5-line]"
				href="/settings"
				label={t("Settings")}
			>
				<a href="/settings" class="content-center text-end">
					v{version}
				</a>
			</DropdownItem>
		</ul>
	);
}
