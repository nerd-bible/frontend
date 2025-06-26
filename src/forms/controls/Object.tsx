import type * as z from "zod/v4/core";
import { DynamicControl, type DynamicControlProps } from "./Dynamic";
import { Show, For, type JSX, mergeProps, splitProps } from "solid-js";
import { objectRegistry } from "../registry";

export function ObjectControl<T extends z.$ZodObject>(
	props: JSX.HTMLElementTags["fieldset"] & DynamicControlProps<T>
) {
	props = mergeProps(props, objectRegistry.get(props.schema) ?? {});
	const [_, fieldsetProps] = splitProps(props, [
		"name",
		"label",
		"schema",
		"value",
		"setValue",
	]);

	return (
		<fieldset {...fieldsetProps}>
			<Show when={props.label ?? props.name}>
				<legend>{props.label ?? props.name}</legend>
			</Show>
			<For each={Object.entries(props.schema._zod.def.shape)}>
				{([name, schema]) => (
					<DynamicControl
						name={name}
						schema={schema as z.$ZodType}
						value={(props.value as any)[name]}
						setValue={(...args: any[]) =>
							// @ts-ignore
							props.setValue(name as any, ...args)
						}
					/>
				)}
			</For>
		</fieldset>
	);
}
