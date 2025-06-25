import { registry } from "../registry";
import * as z from "zod/v4/core";
import clsx from "clsx";
import {
	createEffect,
	createSignal,
	type JSX,
	splitProps,
	For,
	Show,
	mergeProps,
} from "solid-js";
import { computePosition, flip, shift, arrow, offset } from "@floating-ui/dom";

type InputProps = JSX.HTMLElementTags["input"];

export type TextFieldProps = InputProps & {
	label?: string;
	schema: z.$ZodString;
	setValue: (v: string | number) => void;
};

let counter = 0;

export function TextControl(props: TextFieldProps) {
	props = mergeProps(
		props,
		{ type: props.schema._zod.def.type },
		registry.get(props.schema),
	);
	const [_, rest] = splitProps(props, ["name", "class"]);
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

	function getValue(ev: { currentTarget: HTMLInputElement }) {
		const v = ev.currentTarget.value;
		if (props.type === "number") return +v;
		return v;
	}

	function validate(input: any) {
		return z
			.safeParse(props.schema, input, { reportInput: true })
			.error?.issues?.map((issue) => issue.message);
	}

	return (
		<span class="flex grow">
			<label for={name}>{props.name}</label>
			<input
				ref={input}
				id={name}
				name={props.name}
				autocomplete="off"
				aria-invalid={Boolean(error())}
				aria-describedby={nameHint}
				onBlur={(ev: { currentTarget: HTMLInputElement }) =>
					setError(validate?.(getValue(ev)))
				}
				onInput={(ev: { currentTarget: HTMLInputElement }) => {
					if (dirty() && error()) setError(validate?.(getValue(ev)));
					setDirty(true);
					props.setValue(getValue(ev));
				}}
				class={clsx("grow", props.class)}
				{...rest}
			/>
			<p class="label">{props.label}</p>
			<div
				ref={tooltip}
				id={nameHint}
				role="tooltip"
				class="bg-error-content absolute w-max text-primary-content"
			>
				<Show when={error()}>
					<ul class="p-2">
						<For each={error()}>{(msg) => <li>{msg}</li>}</For>
					</ul>
					<div ref={arrowEle} class="absolute rotate-45 w-4 h-4 bg-inherit" />
				</Show>
			</div>
		</span>
	);
}
