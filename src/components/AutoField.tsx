import * as v from "valibot";
import { TextField } from "./TextField";
import { For, Match, Switch, Show, createEffect, Index } from "solid-js";
import { Button } from "./Button";
import type { SetStoreFunction, Store } from "solid-js/store";

function getDefaults<T extends AnySchema>(schema: T): v.InferInput<T> {
	switch (schema.type) {
		case "string":
		case "number":
			return "";
		case "array":
			return [getDefaults((schema as v.ArraySchema<any, any>).item)];
		case "object":
			return Object.entries(
				(schema as v.ObjectSchema<any, any>).entries,
			).reduce((acc, [key, s]) => {
				acc[key] = getDefaults(s as AnySchema);
				return acc;
			}, {} as Record<string, any>);
	}
}

function AutoObject<T extends v.ObjectSchema<any, any>>(props: {
	schema: T;
	value: Store<v.InferInput<T>>;
	setValue: SetStoreFunction<v.InferInput<T>>;
}) {
	return (
		<For each={Object.entries(props.schema.entries)}>
			{([name, schema]) => (
				<AutoField
					name={name}
					schema={schema as AnySchema}
					value={(props.value as any)[name]}
					setValue={(...args: any[]) =>
						// @ts-ignore
						props.setValue(name as any, ...args)
					}
				/>
			)}
		</For>
	);
}

function AutoArray<T>(props: {
	schema: v.ArraySchema<any, any>;
	value: Store<T[]>;
	setValue: SetStoreFunction<T[]>;
}) {
	function swap(i: number) {
		console.log("swap", i);
		const arr = [...props.value];
		const tmp = arr[i];
		arr[i] = arr[i + 1];
		arr[i + 1] = tmp;
		props.setValue(arr);
	}

	createEffect(() => {
		console.log(props.value);
	});

	return (
		<Index each={props.value}>
			{(v, i) => (
				<div class="flex">
					{/** TODO: https://solid-dnd.com/?example=Sortable%2520list%2520%28vertical%29#examples */}
					{/* <span class="self-center">m</span> */}
					<AutoField
						class="inline-flex flex-col sm:flex-row grow"
						schema={props.schema.item}
						value={v()}
						setValue={(...args: any) => {
							// @ts-ignore
							props.setValue(i, ...args);
						}}
					/>
					<div class="grid grid-cols-2">
						<Button
							class="btn-xs"
							onPointerDown={() => swap(i - 1)}
							disabled={i === 0}
						>
							⬆
						</Button>
						<Button
							class="btn-xs"
							onPointerDown={() => {
								const newArr = [...props.value];
								newArr.splice(i, 1);
								props.setValue(newArr);
							}}
							disabled={props.value.length === 1}
						>
							-
						</Button>
						<Button
							class="btn-xs"
							onPointerDown={() => swap(i)}
							disabled={i === props.value.length - 1}
						>
							⬇
						</Button>
						<Button
							class="btn-xs"
							onPointerDown={() => {
								const newArr = [...props.value];
								newArr.splice(i + 1, 0, getDefaults(props.schema.item));
								props.setValue(newArr);
							}}
						>
							+
						</Button>
					</div>
				</div>
			)}
		</Index>
	);
}

type AnySchema = v.ObjectEntries[string];

export function AutoField<T extends AnySchema>(props: {
	name?: string;
	schema: T;
	value: Store<v.InferInput<T>>;
	setValue: SetStoreFunction<v.InferInput<T>>;
	class?: string;
}) {
	const t = props.schema.type;
	return (
		<Switch>
			<Match when={t === "string"}>
				<TextField
					name={props.name}
					class={props.class}
					value={props.value as string}
					type={props.name}
					validate={(input) =>
						v
							.safeParse(props.schema, input)
							.issues?.map((issue) => issue.message)
					}
					onInput={(ev) => props.setValue(ev.currentTarget.value)}
				/>
			</Match>
			<Match when={t === "object"}>
				<fieldset name={props.name} class={props.class}>
					<Show when={props.name}>
						<legend>{props.name}</legend>
					</Show>
					<AutoObject
						schema={props.schema as v.ObjectSchema<any, any>}
						value={props.value as any}
						setValue={props.setValue as any}
					/>
				</fieldset>
			</Match>
			<Match when={t === "array"}>
				<fieldset name={props.name} class={props.class}>
					<Show when={props.name}>
						<legend>{props.name}</legend>
					</Show>
					<AutoArray
						schema={props.schema as v.ArraySchema<any, any>}
						value={props.value as any[]}
						setValue={props.setValue as SetStoreFunction<any[]>}
					/>
				</fieldset>
			</Match>
		</Switch>
	);
}
