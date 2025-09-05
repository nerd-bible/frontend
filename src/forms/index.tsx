import type * as z from "zod";
import { type Store, type SetStoreFunction, createStore } from "solid-js/store";
import { empty } from "./empty";
import { Form } from "./Form";
import type { JSX } from "solid-js";

export * from "./registry";

export function createForm<T extends z.$ZodObject>(
	schema: T,
	store?: [store: Store<z.output<T>>, setStore: SetStoreFunction<z.output<T>>],
) {
	store ??= createStore(empty(schema));

	return [
		(props: JSX.HTMLElementTags["form"]) => <Form schema={schema} value={store[0]} setValue={store[1]} {...props} />,
		store[0],
		store[1],
	] as const;
}
