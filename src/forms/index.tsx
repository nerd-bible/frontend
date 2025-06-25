import { DynamicControl, type DynamicControlProps } from "./controls/Dynamic";
import type * as z from "zod/v4/core";
import { type Store, type SetStoreFunction, createStore } from "solid-js/store";
import { empty } from "./empty";

export * from "./registry";

export function createForm<T extends z.$ZodObject>(
	schema: T,
	store?: [store: Store<z.output<T>>, setStore: SetStoreFunction<z.output<T>>],
) {
	store ??= createStore(empty(schema));

	return [
		(props: Partial<DynamicControlProps<T>>) => (
			<DynamicControl<T>
				{...props}
				schema={schema}
				value={store[0]}
				setValue={store[1]}
			/>
		),
		store[0],
		store[1],
	] as const;
}
