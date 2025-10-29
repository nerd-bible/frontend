import { textRegistry } from "../registry";
import type * as z from "zod";
import {
	splitProps,
	Show,
	mergeProps,
	createUniqueId,
} from "solid-js";
import type { DynamicControlProps } from "./Dynamic";
import { Dynamic } from "solid-js/web";
import { Errors } from "../Errors";

export function TextControl<T extends z.$ZodString | z.$ZodNumber>(
	props: DynamicControlProps<T, "input"> & {
			description?: string;
			optional?: boolean;
			inputEle?: "input" | "textarea";
			schema: z.$ZodString | z.$ZodNumber;
			value: string | number;
			setValue: (v: string | number) => void;
		},
) {
	props = mergeProps(
		props,
		{ type: props.schema._zod.def.type },
		textRegistry.get(props.schema) as any ?? {},
	);
	const [_, rest] = splitProps(props, [
		"name",
		"class",
		"schema",
		"setValue",
		"description",
		"inputEle",
		"errors",
	]);

	type Input = HTMLInputElement | HTMLTextAreaElement;

	const inputId = props.id ?? `${props.name}${createUniqueId()}`;
	const descId = `${inputId}-desc`;
	const hintId = `${inputId}-hint`;

	function getValue(ev: { currentTarget: Input }) {
		const v = ev.currentTarget.value;
		if (props.type === "string") return v;
		return +v;
	}

	function isRequired() {
		if (props.optional) return false;
		return Object.keys(props.schema._zod.def).length > 1; // hack
	}

	return (
		<span class="text-control">
			<label for={inputId}>
				{props.label ?? props.name}
				<Show when={isRequired()}>
					<span class="required-field" />
				</Show>
			</label>
			<Dynamic
				component={props.inputEle ?? "input"}
				id={inputId}
				autocomplete="off"
				aria-describedby={`${descId} ${hintId}`}
				onInput={(ev: { currentTarget: Input }) => props.setValue(getValue(ev))}
				min={props.schema._zod.bag.minimum}
				max={props.schema._zod.bag.maximum}
				rows={3}
				aria-invalid={props.errors.length > 0}
				{...rest}
			/>
			<p id={descId}>{props.description}</p>
			<Errors errors={props.errors} />
		</span>
	);
}
