import { createUniqueId, type JSX, splitProps, children, For } from "solid-js";

type DropdownProps = JSX.HTMLElementTags["div"] & {
	button: JSX.Element;
	disabled?: boolean;
};
export function Dropdown(props: DropdownProps) {
	const [_, divProps] = splitProps(props, ["disabled", "button"]);
	const id = createUniqueId();
	const anchorName = `--${id}`;
	const resolved = children(() => props.children);

	return (
		<div {...divProps}>
			<button
				type="button"
				disabled={props.disabled}
				popoverTarget={id}
				style={{ "anchor-name": anchorName } as any}
			>
				{props.button}
			</button>
			<div
				class="absolute bg-mix-[lighten/25] rounded text-fg py-2"
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
						{r => <li class="p-4 hover:bg-mix-[fg/10]">{r}</li>}
					</For>
				</ul>
			</div>
		</div>
	);
}
