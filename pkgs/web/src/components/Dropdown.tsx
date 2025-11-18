import { autoUpdate, flip, shift } from "@floating-ui/dom";
import { useFloating } from "solid-floating-ui";
import { createSignal, createUniqueId, type JSX } from "solid-js";

type DropdownProps = {
	button: JSX.Element;
	disabled?: boolean;
	children: any;
};
export function Dropdown(props: DropdownProps) {
	const id = createUniqueId();
	const anchorName = `--${id}`;
	const [open, setOpen] = createSignal(false);
	const [reference, setReference] = createSignal<HTMLElement>();
	const [floating, setFloating] = createSignal<HTMLElement>();

	const position = useFloating(reference, floating, {
		whileElementsMounted: autoUpdate,
		placement: "bottom-end",
	});

	return (
		<>
			<button
				type="button"
				disabled={props.disabled}
				popoverTarget={id}
				classList={{ active: open() }}
				onClick={() => setOpen((o) => !o)}
				style={{ "anchor-name": anchorName } as any}
				ref={setReference}
			>
				{props.button}
			</button>
			<div
				class="absolute bg-bg-200 text-fg rounded shadow-lg shadow-fg/20"
				classList={{ hidden: !open() }}
				ref={setFloating}
				style={{
					position: position.strategy,
					top: `${position.y ?? 0}px`,
					left: `${position.x ?? 0}px`,
				}}
			>
				{props.children}
			</div>
		</>
	);
}
