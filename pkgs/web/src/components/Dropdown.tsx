import {
	children,
	createSignal,
	createUniqueId,
	For,
	type JSX,
	splitProps,
} from "solid-js";

type DropdownProps = JSX.HTMLElementTags["div"] & {
	button: JSX.Element;
	disabled?: boolean;
};
export function Dropdown(props: DropdownProps) {
	const [_, divProps] = splitProps(props, ["disabled", "button"]);
	const id = createUniqueId();
	const anchorName = `--${id}`;
	const resolved = children(() => props.children);
	const [open, setOpen] = createSignal(false);
	props.class ??= "";
	props.class += " p-1";

	return (
		<div {...divProps}>
			<button
				type="button"
				disabled={props.disabled}
				popoverTarget={id}
				classList={{
					active: open(),
				}}
				style={{ "anchor-name": anchorName } as any}
			>
				{props.button}
			</button>
			<div
				class="absolute bg-mix-[lighten/20] rounded text-fg py-2 shadow-lg shadow-fg"
				onBeforeToggle={(ev) => setOpen(ev.newState === "open")}
				popover
				id={id}
				style={
					{
						"position-anchor": anchorName,
						"position-area": "bottom span-right",
						"position-try-fallbacks": "flip-inline",
					} as any
				}
			>
				<ul class="flex flex-col">
					<For each={resolved.toArray()}>
						{(r) => <li class="p-2 hover:bg-mix-[fg/10]">{r}</li>}
					</For>
				</ul>
			</div>
		</div>
	);
}
