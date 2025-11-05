import { ThemePicker } from "./components/ThemePicker";

type DropdownProps = {
	children?: any;
	icon: string;
	label: string;
	href: string;
};
function DropdownItem(props: DropdownProps) {
	return (
		<li class="flex hover:bg-mix-[darken/10]">
			<a
				href={props.href}
				class="p-2 leading-none flex items-center grow"
			>
				<span class={`mx-2 ${props.icon}`} />
				<span>{props.label}</span>
			</a>
			{props.children}
		</li>
	);
}

export function QuickSettings() {
	return (
		<ul class="flex flex-col w-86 select-none">
			<DropdownItem
				icon="icon-[mingcute--paint-brush-line]"
				href="/settings/theme"
				label="Theme"
			>
				<ThemePicker />
			</DropdownItem>
			<DropdownItem
				icon="icon-[mingcute--settings-5-line]"
				href="/settings"
				label="Settings"
			/>
		</ul>
	);
}
