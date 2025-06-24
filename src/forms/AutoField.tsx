import * as z from "zod/v4/core";
import { TextField } from "./TextField";
import { For, Match, Switch, Show, Index } from "solid-js";
import { Button } from "./Button";
import type { SetStoreFunction, Store } from "solid-js/store";
import { empty } from "../forms/schema/empty";

function AutoObject<T extends z.$ZodObject>(props: {
	schema: T;
	value: Store<z.input<T>>;
	setValue: SetStoreFunction<z.input<T>>;
}) {
	return (
		<For each={Object.entries(props.schema._zod.def.shape)}>
			{([name, schema]) => (
				<AutoField
					name={name}
					schema={schema}
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

function AutoArray<T extends z.$ZodArray>(props: {
	schema: T,
	value: Store<z.infer<T>[]>;
	setValue: SetStoreFunction<z.infer<T>[]>;
}) {
	function swap(i: number) {
		const arr = props.value;
		const tmp = arr[i];
		props.setValue(i, arr[i + 1]);
		props.setValue(i + 1, tmp);
	}

	return (
		<Index each={props.value}>
			{(v, i) => (
				<div class="flex">
					{/** TODO: https://solid-dnd.com/?example=Sortable%2520list%2520%28vertical%29#examples */}
					{/* <span class="self-center">m</span> */}
					<AutoField
						class="inline-flex flex-col sm:flex-row grow"
						schema={props.schema._zod.def.element}
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
								newArr.splice(i + 1, 0, empty(props.schema._zod.def.element));
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

export function AutoField<T extends z.$ZodType>(props: {
	name?: string;
	schema: T;
	value: Store<z.output<T>>;
	setValue: SetStoreFunction<z.output<T>>;
	class?: string;
}) {
	const t = props.schema._zod.def.type;
	if (props.schema._zod.def.checks) console.log("checks", props.name, props.schema._zod.def.checks)

	return (
		<Switch>
			<Match when={t === "string"}>
				<TextField
					name={props.name}
					class={props.class}
					value={props.value as string}
					type={props.schema._zod.def.format}
					validate={(input) =>
						z
							.safeParse(props.schema, input, { reportInput: true })
							.error?.issues?.map((issue) => issue.message)
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
						schema={props.schema as unknown as z.$ZodObject}
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
						schema={props.schema as unknown as z.$ZodArray}
						value={props.value as any[]}
						setValue={props.setValue as SetStoreFunction<any[]>}
					/>
				</fieldset>
			</Match>
			<Match when={t === "optional"}>
				<AutoField
					name={props.name}
					schema={(props.schema._zod.def as z.$ZodOptionalDef).innerType}
					value={props.value}
					setValue={props.setValue}
					class={props.class}
				/>
			</Match>
		</Switch>
	);
}
