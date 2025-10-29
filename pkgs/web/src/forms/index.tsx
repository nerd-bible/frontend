import type * as z from "@nerd-bible/valio";
import type { JSX } from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { empty } from "./empty";
import { Form } from "./Form";

export * from "./registry";

export function createForm<T extends z.Pipe>(
	schema: T,
	store?: [store: Store<z.Output<T>>, setStore: SetStoreFunction<z.Output<T>>],
) {
	store ??= createStore(empty(schema));

	return [
		(props: JSX.HTMLElementTags["form"]) => (
			<Form schema={schema} value={store[0]} setValue={store[1]} {...props} />
		),
		store[0],
		store[1],
	] as const;
}
