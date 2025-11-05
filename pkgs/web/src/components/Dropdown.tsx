import { createSignal, createUniqueId, type JSX, splitProps } from "solid-js";

type DropdownProps = JSX.HTMLElementTags["div"] & {
	button: JSX.Element;
	disabled?: boolean;
};
export function Dropdown(props: DropdownProps) {
	const [_, divProps] = splitProps(props, ["disabled", "button"]);
	const id = createUniqueId();
	const anchorName = `--${id}`;
	const [open, setOpen] = createSignal(false);

	return (
		<div {...divProps}>
			<button
				type="button"
				disabled={props.disabled}
				popoverTarget={id}
				classList={{ active: open() }}
				style={{ "anchor-name": anchorName } as any}
			>
				{props.button}
			</button>
			<div
				class="absolute bg-mix-[lighten/20] rounded text-fg py-2 shadow-lg shadow-fg/20"
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
				{props.children}
			</div>
		</div>
	);
}
