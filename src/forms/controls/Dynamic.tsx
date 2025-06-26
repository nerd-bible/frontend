import { Switch, Match } from "solid-js";
import type { Component, JSX } from "solid-js";
import type * as z from "zod/v4/core";
import { TextControl } from "./Text";
import { Dynamic as Dynamic2 } from "solid-js/web";
import type { SetStoreFunction, Store } from "solid-js/store";
import { OptionalControl } from "./Optional";
import { ObjectControl } from "./Object";
import { ArrayControl } from "./Array";

type Controls = Partial<
	Record<z.$ZodTypeDef["type"], Component<DynamicControlProps<any>>>
>;
export const controls: Controls = {
	string: TextControl,
	number: TextControl,
	object: ObjectControl,
	array: ArrayControl,
	optional: OptionalControl,
};

export type DynamicControlProps<T extends z.$ZodType> = Omit<
	JSX.HTMLAttributes<HTMLElement>,
	"ref"
> & {
	name?: string;
	label?: JSX.Element;
	schema: T;
	value: Store<z.output<T>>;
	setValue: SetStoreFunction<z.output<T>>;
};

export function DynamicControl<T extends z.$ZodType>(
	props: DynamicControlProps<T>,
) {
	const t = props.schema._zod.def.type;
	const component = controls[t];

	return (
		<Switch fallback={<span>TODO: add "{t}" control</span>}>
			<Match when={component}>
				<Dynamic2 component={component} {...props} />
			</Match>
		</Switch>
	);
}
