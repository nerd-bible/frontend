import { autoUpdate, shift } from "@floating-ui/dom";
import { useFloating } from "solid-floating-ui";
import { createEffect, createSignal, createUniqueId, type JSX } from "solid-js";

export const [hasPopover, setHasPopover] = createSignal(false);

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
		middleware: [shift()],
	});

	createEffect(() => setHasPopover(open()));

	function onClick(ev: PointerEvent) {
		if (!floating()?.contains(ev.target as Node)) {
			setOpen(false);
			document.removeEventListener("click", onClick);
		}
	}

	return (
		<>
			<button
				type="button"
				disabled={props.disabled}
				popoverTarget={id}
				classList={{ active: open() }}
				onClick={() => {
					setOpen((o) => {
						if (!o) {
							document.addEventListener("click", onClick);
						}
						return !o;
					});
				}}
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
