import type { Component, JSX, Signal } from "solid-js";
import { Match, Switch } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import { Dynamic as Dynamic2 } from "solid-js/web";
import type * as z from "zod";
import { ArrayControl } from "./Array";
import { ObjectControl } from "./Object";
import { OptionalControl } from "./Optional";
import { TextControl } from "./Text";

type Controls = Partial<
	Record<z.core.$ZodTypeDef["type"], Component<DynamicControlProps<any, any>>>
>;
export const controls: Controls = {
	string: TextControl,
	number: TextControl,
	object: ObjectControl,
	array: ArrayControl,
	optional: OptionalControl,
};

export type DynamicControlProps<
	T extends z.core.$ZodType,
	U extends keyof JSX.HTMLElementTags,
> = JSX.HTMLElementTags[U] & {
	name?: string;
	label?: JSX.Element | string;
	schema: T;
	value: Store<z.output<T>>;
	setValue: SetStoreFunction<z.output<T>>;
	errors: Signal<z.core.$ZodError<T>>;
};

export function DynamicControl<
	T extends z.core.$ZodType,
	U extends keyof JSX.HTMLElementTags,
>(props: DynamicControlProps<T, U>) {
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
