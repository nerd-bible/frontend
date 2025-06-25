import { For, Show, Index, type Component } from "solid-js";
import { DynamicControl } from "./Dynamic";

export function ArrayControl<T extends z.$ZodType>(
	props: TextFieldProps & ControlProps<T>,
) {
	function swap(i: number) {
		const arr = props.value;
		const tmp = arr[i];
		props.setValue(i, arr[i + 1]);
		props.setValue(i + 1, tmp);
	}

	return (
		<fieldset name={props.name} class={props.class}>
			<Show when={props.name}>
				<legend>{props.name}</legend>
			</Show>
			<Index each={props.value}>
				{(v, i) => (
					<div class="flex">
						{/** TODO: https://solid-dnd.com/?example=Sortable%2520list%2520%28vertical%29#examples */}
						{/* <span class="self-center">m</span> */}
						<DynamicControl
							class="inline-flex flex-col sm:flex-row grow"
							schema={props.schema._zod.def.element}
							value={v()}
							setValue={(...args: any) => {
								// @ts-ignore
								props.setValue(i, ...args);
							}}
						/>
						<div class="grid grid-cols-2">
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
								onPointerDown={() => {
									const newArr = [...props.value];
									newArr.splice(i, 1);
									props.setValue(newArr);
								}}
								disabled={props.value.length === 1}
							>
								-
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
									newArr.splice(i + 1, 0, empty(props.schema._zod.def.element));
									props.setValue(newArr);
								}}
							>
								+
							</button>
						</div>
					</div>
				)}
			</Index>
		</fieldset>
	);
}
