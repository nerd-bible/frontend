import { For, mergeProps, Show, splitProps } from "solid-js";
import type * as z from "zod";
import { objectRegistry } from "../registry";
import { DynamicControl, type DynamicControlProps } from "./Dynamic";

export function ObjectControl<T extends z.$ZodObject>(
	props: DynamicControlProps<T, "fieldset">,
) {
	props = mergeProps(props, (objectRegistry.get(props.schema) as any) ?? {});
	const [_, fieldsetProps] = splitProps(props, [
		"name",
		"label",
		"schema",
		"value",
		"setValue",
		"hintId",
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
							// @ts-expect-error
							props.setValue(name as any, ...args)
						}
						hintId={props.hintId}
					/>
				)}
			</For>
		</fieldset>
	);
}
