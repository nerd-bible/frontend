import { For, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import { version } from "../package.json";
import { ThemePicker } from "./components/ThemePicker";
import { I18nCtx, locales } from "./i18n";
import {
	columnWidth,
	fontSize,
	locale,
	setColumnWidth,
	setFontSize,
	setLocale,
} from "./settings";

type DropdownProps = {
	children?: any;
	icon: string;
	label: string;
	href?: string;
	labelFor?: string;
};
function DropdownItem(props: DropdownProps) {
	return (
		<Dynamic
			class="grid grid-cols-subgrid col-span-2 hover:bg-fg/10 pe-4"
			component={props.href ? "a" : "div"}
			href={props.href}
		>
			<Dynamic
				class="p-4"
				component={props.labelFor ? "label" : "div"}
				for={props.labelFor}
			>
				<span class="flex items-center gap-2">
					<span class={`hidden sm:inline ${props.icon}`} />
					<span>{props.label}</span>
				</span>
			</Dynamic>
			{props.children}
		</Dynamic>
	);
}

export function QuickSettings() {
	const t = useContext(I18nCtx);

	return (
		<form
			class="grid grid-cols-[minmax(0,1fr)_1fr] w-96 select-none my-4"
			onSubmit={(ev) => ev.preventDefault()}
		>
			<DropdownItem
				icon="icon-[mingcute--paint-brush-line] scale-x-[-1]"
				label={t()("Theme")}
			>
				<ThemePicker />
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--font-size-line]"
				label={t()("Font size")}
				labelFor="fontSize"
			>
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--font-size-line]"
				label={t()("Column width")}
				labelFor="columnWidth"
			>
				<input
					id="columnWidth"
					class="w-42"
					type="range"
					min={100}
					max={1000}
					step={50}
					value={Number.parseInt(columnWidth(), 10)}
					onInput={(ev) => setColumnWidth(`${ev.target.value}px`)}
				/>
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--globe-line]"
				label={t()("Language")}
				labelFor="language"
			>
				<select
					id="language"
					class="ps-2"
					value={locale()}
					onChange={(ev) => setLocale(ev.target.value)}
				>
					<For each={locales}>
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
				label={t()("Settings")}
			>
				<span class="content-center flex justify-end items-center">
					v{version}
				</span>
			</DropdownItem>
		</form>
	);
}
