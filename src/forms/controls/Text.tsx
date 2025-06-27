import { textRegistry } from "../registry";
import * as z from "zod/v4/core";
import {
	createEffect,
	createSignal,
	type JSX,
	splitProps,
	For,
	Show,
	mergeProps,
	createUniqueId,
} from "solid-js";
import { computePosition, flip, shift, arrow, offset } from "@floating-ui/dom";
import type { DynamicControlProps } from "./Dynamic";
import { Dynamic } from "solid-js/web";

export function TextControl<T extends z.$ZodString | z.$ZodNumber>(
	props: JSX.HTMLElementTags["input"] &
	DynamicControlProps<T> & {
		description?: string;
		optional?: boolean;
		inputEle?: "input" | "textarea";
		schema: z.$ZodString | z.$ZodNumber;
		setValue: (v: string | number) => void;
	},
) {
	props = mergeProps(
		{ inputEle: "input" } as const,
		props,
		{ type: props.schema._zod.def.type },
		textRegistry.get(props.schema) ?? {},
	);
	const [_, rest] = splitProps(props, [
		"name",
		"class",
		"schema",
		"setValue",
		"description",
		"inputEle",
	]);
	const [error, setError] = createSignal<string[] | undefined>(undefined);
	const [dirty, setDirty] = createSignal(false);

	let input!: HTMLInputElement | HTMLTextAreaElement;
	let tooltip!: HTMLDivElement;
	let arrowEle!: HTMLDivElement;

	const inputId = props.id ?? `${props.name}${createUniqueId()}`;
	const descId = `${inputId}-desc`;
	const toolTipId = `${inputId}-hint`;

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

	function getValue(ev: { currentTarget: typeof input }) {
		const v = ev.currentTarget.value;
		if (props.type === "string") return v;
		return +v;
	}

	function validate(input: any) {
		return z
			.safeParse(props.schema, input, { reportInput: true })
			.error?.issues?.map((issue) => issue.message);
	}

	const InputEle = props.inputEle ?? "input";

	return (
		<span class="text-control">
			<label for={inputId}>
				{props.label ?? props.name}
				<Show when={!props.optional}>
					<span class="required-field" />
				</Show>
			</label>
			<Dynamic
				component={InputEle}
				ref={input as any}
				id={inputId}
				autocomplete="off"
				aria-invalid={Boolean(error())}
				aria-describedby={`${descId} ${toolTipId}`}
				onBlur={(ev: { currentTarget: typeof input }) =>
					setError(validate?.(getValue(ev)))
				}
				onInput={(ev: { currentTarget: typeof input }) => {
					if (dirty() && error()) setError(validate?.(getValue(ev)));
					setDirty(true);
					props.setValue(getValue(ev));
				}}
				min={props.schema._zod.bag.minimum}
				max={props.schema._zod.bag.maximum}
				rows={3}
				{...rest}
			/>
			<p id={descId}>{props.description}</p>
			<div ref={tooltip} id={toolTipId} role="tooltip">
				<Show when={error()}>
					<ul><For each={error()}>{(msg) => <li>{msg}</li>}</For></ul>
					<div class="arrow" ref={arrowEle} />
				</Show>
			</div>
		</span>
	);
}
