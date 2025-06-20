import clsx from "clsx";
import {
	createEffect,
	createSignal,
	type JSX,
	splitProps,
	For,
	Show,
} from "solid-js";
import { computePosition, flip, shift, arrow, offset } from "@floating-ui/dom";

type InputProps = JSX.HTMLElementTags["input"];

type TextFieldProps = InputProps & {
	validate?: (
		v: string | number | string[] | undefined,
	) => string[] | undefined;
};

let counter = 0;

export function TextField(props: TextFieldProps) {
	const [_, rest] = splitProps(props, ["name", "class", "validate"]);
	const [error, setError] = createSignal<string[] | undefined>(undefined);
	const [dirty, setDirty] = createSignal(false);

	let input!: HTMLInputElement;
	let tooltip!: HTMLDivElement;
	let arrowEle!: HTMLDivElement;

	const name = `field${counter++}`;
	const nameHint = `${name}-hint`;

	const padding = (n: number) => {
		const computedStyle = getComputedStyle(document.documentElement);
		const rems = computedStyle.getPropertyValue("--spacing");
		return (
			Number.parseFloat(rems) * Number.parseFloat(computedStyle.fontSize) * n
		);
	};

	createEffect(() => {
		error(); // this is what resizes `tooltip`
		if (!input || !tooltip || !arrowEle) return;
		computePosition(input, tooltip, {
			placement: "bottom",
			middleware: [
				offset(padding(3)),
				flip(),
				shift({ padding: padding(4) }),
				arrow({ element: arrowEle }),
			],
		}).then(({ x, y, placement, middlewareData }) => {
			Object.assign(tooltip.style, {
				left: `${x}px`,
				top: `${y}px`,
			});

			if (middlewareData.arrow) {
				const staticSide = {
					top: "bottom",
					right: "left",
					bottom: "top",
					left: "right",
				}[placement.split("-")[0] as "top"];

				Object.assign(arrowEle.style, {
					left: `${middlewareData.arrow.x}px`,
					top: `${middlewareData.arrow.y}px`,
					right: "",
					bottom: "",
					[staticSide]: "-4px",
				});
			}
		});
	});

	return (
		<span class="flex grow">
			<label for={name}>{props.name}</label>
			<input
				ref={input}
				id={name}
				name={props.name}
				aria-invalid={Boolean(error())}
				aria-describedby={nameHint}
				onBlur={(ev) => setError(props.validate?.(ev.currentTarget.value))}
				onInput={(ev) => {
					if (dirty() && error())
						setError(props.validate?.(ev.currentTarget.value));
					setDirty(true);
				}}
				class={clsx("grow", props.class)}
				{...rest}
			/>
			<div
				ref={tooltip}
				id={nameHint}
				role="tooltip"
				class="bg-blue-50 absolute w-max"
			>
				<Show when={error()}>
					<ul>
						<For each={error()}>{(msg) => <li>{msg}</li>}</For>
					</ul>
					<div ref={arrowEle} class="absolute rotate-45 w-2 h-2 bg-blue-50" />
				</Show>
			</div>
		</span>
	);
}
