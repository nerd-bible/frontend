import {
	type JSX,
	Show,
	createSignal,
	onCleanup,
	onMount,
	splitProps,
} from "solid-js";

export function Dropdown(
	props: JSX.HTMLElementTags["div"] & {
		button: JSX.Element;
		disabled: boolean;
	},
) {
	const [_, divProps] = splitProps(props, ["disabled"]);
	const [open, setOpen] = createSignal(false);

	let button!: HTMLButtonElement;

	const close = (ev: MouseEvent) => {
		if (!button.contains(ev.target as Node)) setOpen(false);
	};
	onMount(() => {
		document.addEventListener("click", close);
	});
	onCleanup(() => {
		document.removeEventListener("click", close);
	});

	return (
		<div class="dropdown" classList={{ "dropdown-open": open() }} {...divProps}>
			<button
				ref={button}
				type="button"
				class="m-1"
				disabled={props.disabled}
				onClick={() => setOpen((o) => !o)}
			>
				{props.button}
			</button>
			<Show when={open()}>
				<ul class="menu dropdown-content rounded-box z-2 p-2 shadow-sm">
					{props.children}
				</ul>
			</Show>
		</div>
	);
}
