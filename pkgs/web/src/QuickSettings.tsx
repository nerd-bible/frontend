import { type Accessor, For, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import { version } from "../package.json";
import { ThemePicker } from "./components/ThemePicker";
import { IntlCtx, locale, locales, setLocale } from "./i18n";

type DropdownProps = {
	children?: any;
	icon: string;
	label: Accessor<string>;
	href?: string;
	labelFor?: string;
};
function DropdownItem(props: DropdownProps) {
	return (
		<div class="grid grid-cols-subgrid col-span-2 hover:bg-fg/10 pe-4">
			<Dynamic
				class="p-4"
				component={props.labelFor ? "label" : "div"}
				for={props.labelFor}
			>
				<Dynamic
					class="flex items-center gap-2"
					component={props.href ? "a" : "div"}
					href={props.href}
				>
					<span class={`hidden sm:inline ${props.icon}`} />
					<span>{props.label()}</span>
				</Dynamic>
			</Dynamic>
			{props.children}
		</div>
	);
}

export function QuickSettings() {
	const t = useContext(IntlCtx);

	return (
		<form
			class="grid grid-cols-[minmax(0,1fr)_1fr] w-96 select-none my-4"
			onSubmit={(ev) => ev.preventDefault()}
		>
			<DropdownItem
				icon="icon-[mingcute--paint-brush-line] scale-x-[-1]"
				label={t("Theme")}
			>
				<ThemePicker />
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--font-size-line]"
				label={t("Font size")}
				labelFor="fontSize"
			>
				<input
					id="fontSize"
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
				label={t("Language")}
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
				label={t("Settings")}
			>
				<a href="/settings" class="content-center text-end">
					v{version}
				</a>
			</DropdownItem>
		</form>
	);
}
