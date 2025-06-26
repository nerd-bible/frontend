import type * as z from "zod/v4/core";
import { Show, Index, type JSX, mergeProps, splitProps } from "solid-js";
import { DynamicControl, type DynamicControlProps } from "./Dynamic";
import { arrayRegistry } from "../registry";
import { empty } from "../empty";

export function ArrayControl<T extends z.$ZodArray>(
	props: JSX.HTMLElementTags["fieldset"] & DynamicControlProps<T>,
) {
	props = mergeProps(props, arrayRegistry.get(props.schema) ?? {});
	const [_, fieldsetProps] = splitProps(props, [
		"name",
		"label",
		"schema",
		"value",
		"setValue",
	]);

	function swap(i: number) {
		const arr = [...props.value];
		const tmp = arr[i];
		arr[i] = arr[i + 1];
		arr[i + 1] = tmp;
		props.setValue(arr);
	}

	return (
		<fieldset {...fieldsetProps}>
			<Show when={props.label ?? props.name}>
				<legend class="flex justify-between w-full">
					{props.label ?? props.name}
					<button
						type="button"
						class="btn-xs"
						onPointerDown={() => {
							const newArr = [...props.value];
							newArr.unshift(empty(props.schema._zod.def.element));
							props.setValue(newArr);
						}}
					>
						+
					</button>
				</legend>
			</Show>
			<Index each={props.value}>
				{(v, i) => (
					<div>
						{/** TODO: https://solid-dnd.com/?example=Sortable%2520list%2520%28vertical%29#examples */}
						{/* <span class="self-center">m</span> */}
						<DynamicControl
							label={
								<div class="array-controls">
									<button
										type="button"
										class="btn-xs"
										onPointerDown={() => swap(i - 1)}
										disabled={i === 0}
									>
										⬆
									</button>
									<button
										type="button"
										class="btn-xs"
										onPointerDown={() => swap(i)}
										disabled={i === props.value.length - 1}
									>
										⬇
									</button>
									<button
										type="button"
										class="btn-xs"
										onPointerDown={() => {
											const newArr = [...props.value];
											newArr.splice(i, 1);
											props.setValue(newArr);
										}}
										disabled={props.value.length === 1}
									>
										x
									</button>
								</div>
							}
							schema={props.schema._zod.def.element}
							value={v()}
							setValue={(...args: any) => {
								// @ts-ignore
								props.setValue(i, ...args);
							}}
						/>
					</div>
				)}
			</Index>
		</fieldset>
	);
}
