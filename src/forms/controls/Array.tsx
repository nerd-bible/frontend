import type * as z from "zod";
import { Show, mergeProps, splitProps, batch, For } from "solid-js";
import { DynamicControl, type DynamicControlProps } from "./Dynamic";
import { arrayRegistry } from "../registry";
import { empty } from "../empty";
import { Dropdown } from "../../components/Dropdown";

export function ArrayControl<T extends z.$ZodArray>(
	props: DynamicControlProps<T, "fieldset">,
) {
	props = mergeProps(props, arrayRegistry.get(props.schema) as any ?? {});

	const [controlProps, _, fieldsetProps] = splitProps(
		props,
		["schema", "value", "setValue", "hintId"],
		["name", "label"],
	);

	function swapInner(i: number, j: number, arr: any[], setArr: any) {
		if (i === j) return false;

		const updatedItems = [...arr];
		updatedItems.splice(
			j,
			0,
			...updatedItems.splice(i, 1),
		);
		setArr(updatedItems);

		return true;
	}

	function swap(i: number, j: number) {
		return swapInner(i, j, props.value, props.setValue);
	}

	function deleteInner(i: number, arr: any[], setArr: any) {
		setArr(arr.filter((_, j) => i !== j));
	}

	function deleteItem(i: number) {
		deleteInner(i, props.value, props.setValue);
	}

	return (
		<fieldset {...fieldsetProps}>
			<Show when={props.label ?? props.name}>
				<legend>
					{props.label ?? props.name}
					<button
						type="button"
						onPointerDown={() => batch(() => {
							const newArr = [...props.value];
							const emptyItem = empty(props.schema._zod.def.element);
							newArr.push(emptyItem);
							props.setValue(newArr as any);
						})}
					>
						+
					</button>
				</legend>
			</Show>
			<For each={props.value}>
				{(v, i) => (
					<ArrayControlItem
						v={v}
						i={i()}
						swap={swap}
						delete={() => deleteItem(i())}
						{...controlProps}
					/>
				)}
			</For>
		</fieldset>
	);
}

function ArrayControlItem(
	props: DynamicControlProps<any, any> & {
		swap(i: number, j: number): boolean;
		delete(): void;
		v: any;
		i: number;
	},
) {
	let ref!: HTMLDivElement;

	function moveUp() {
		if (props.swap(props.i, props.i - 1)) {
			const button = ref.previousElementSibling?.querySelector("button");
			button?.focus?.();
		}
	}
	function moveDown() {
		if (props.swap(props.i, props.i + 1)) {
			const button = ref.nextElementSibling?.querySelector("button");
			console.log("moveDown", button);
			button?.focus();
		}
	}

	return (
		<div class="array-control" ref={ref}>
			<Dropdown
				disabled={props.value.length === 1}
				button="≡"
			>
				<button type="button" disabled={props.i === 0} onClick={moveUp}>↑</button>
				<button type="button" disabled={props.i === props.value.length - 1} onClick={moveDown}>↓</button>
			</Dropdown>
			<DynamicControl
				label=""
				schema={props.schema._zod.def.element}
				value={props.v}
				setValue={(...args: any) => {
					// @ts-ignore
					props.setValue(props.i, ...args);
				}}
			/>
			<button
				type="button"
				onPointerDown={props.delete}
				disabled={props.value.length === 1}
			>
				x
			</button>
		</div>
	);
}
