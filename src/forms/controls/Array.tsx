import type * as z from "zod/v4/core";
import { Show, Index, type JSX, mergeProps, splitProps } from "solid-js";
import { DynamicControl, type DynamicControlProps } from "./Dynamic";
import { arrayRegistry } from "../registry";
import { empty } from "../empty";

export function ArrayControl<T extends z.$ZodArray>(
	props: JSX.HTMLElementTags["fieldset"] & DynamicControlProps<T>,
) {
	props = mergeProps(props, arrayRegistry.get(props.schema) ?? {});
	const [controlProps, _, fieldsetProps] = splitProps(
		props,
		["schema", "value", "setValue"],
		["name", "label"],
	);

	function swap(i: number) {
		const arr = [...props.value];
		const tmp = arr[i];
		arr[i] = arr[i + 1];
		arr[i + 1] = tmp;
		props.setValue(arr as any);
	}

	return (
		<fieldset {...fieldsetProps}>
			<Show when={props.label ?? props.name}>
				<legend>
					{props.label ?? props.name}
					<button
						type="button"
						onPointerDown={() => {
							const newArr = [...props.value];
							newArr.push(empty(props.schema._zod.def.element));
							props.setValue(newArr as any);
						}}
					>
						+
					</button>
				</legend>
			</Show>
			<Index each={props.value}>
				{(v, i) => (
					<ArrayControlItem v={v()} i={i} swap={swap} {...controlProps} />
				)}
			</Index>
		</fieldset>
	);
}

function ArrayControlItem(
	props: DynamicControlProps<any> & {
		swap(i: number): void;
		v: any;
		i: number;
	},
) {
	return (
		<div class="array-control">
			{/** TODO: Drag and drop. Keyboard arrow up/down. */}
			{/** TODO: Couldn't get https://solid-dnd.com/?example=Sortable%2520list%2520%28vertical%29#examples
						to work in an afternoon because it requires ids that are not list
						indices to show where item will go while dragging */}
			<div class="array-controls">
				<button
					type="button"
					onPointerDown={() => props.swap(props.i - 1)}
					disabled={props.i === 0}
				>
					⬆
				</button>
				<button
					type="button"
					onPointerDown={() => props.swap(props.i)}
					disabled={props.i === props.value.length - 1}
				>
					⬇
				</button>
			</div>
			<DynamicControl
				label=""
				schema={props.schema._zod.def.element}
				value={props.v}
				setValue={(...args: any) => {
					// @ts-ignore
					props.setValue(i, ...args);
				}}
			/>
			<button
				type="button"
				onPointerDown={() => {
					const newArr = [...props.value];
					newArr.splice(props.i, 1);
					props.setValue(newArr);
				}}
				disabled={props.value.length === 1}
			>
				x
			</button>
		</div>
	);
}
