import { autoUpdate, shift } from "@floating-ui/dom";
import { createEffect, createSignal, type JSX } from "solid-js";
import { useFloating } from "./floating";

export const [hasPopover, setHasPopover] = createSignal(false);

type DropdownProps = {
	button: JSX.Element;
	"aria-label"?: string;
	children: any;
};
export function Dropdown(props: DropdownProps) {
	const [open, setOpen] = createSignal(false);
	const [reference, setReference] = createSignal<HTMLElement>();
	const [floating, setFloating] = createSignal<HTMLElement>();

	const position = useFloating(reference, floating, {
		whileMounted: autoUpdate,
		placement: "bottom-end",
		middleware: [shift()],
	});

	createEffect(() => setHasPopover(open()));

	return (
		<>
			<button
				type="button"
				aria-label={props["aria-label"]}
				classList={{ active: open() }}
				onClick={() => {
					setOpen((o) => {
						if (!o) {
							document.addEventListener("click", onClick);
						}
						return !o;
					});
				}}
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
