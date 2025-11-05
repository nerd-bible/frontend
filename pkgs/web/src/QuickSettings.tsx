import { ThemePicker } from "./components/ThemePicker";

function DropdownItem(props: { children?: any; icon: string; label: string }) {
	return (
		<li class="p-2 flex flex-nowrap items-center leading-none">
			<span class={`mx-2 ${props.icon}`} />
			<span class="grow">{props.label}</span>
			{props.children}
		</li>
	);
}

export function QuickSettings() {
	return (
		<ul class="flex flex-col w-86">
			<DropdownItem icon="icon-[mingcute--paint-brush-line]" label="Theme">
				<ThemePicker />
			</DropdownItem>
			<DropdownItem icon="icon-[mingcute--link-line]" label="Sources" />
		</ul>
	);
}
