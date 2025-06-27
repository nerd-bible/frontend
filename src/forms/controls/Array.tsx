import type * as z from "zod/v4/core";
import { Show, Index, type JSX, mergeProps, splitProps } from "solid-js";
import { DynamicControl, type DynamicControlProps } from "./Dynamic";
import { arrayRegistry } from "../registry";
import { empty } from "../empty";
import { useDragDropContext } from "@thisbeyond/solid-dnd";
import {
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
	createSortable,
	closestCenter,
} from "@thisbeyond/solid-dnd";

type Id = string | number; // for solid-dnd

export function ArrayControl<T extends z.$ZodArray>(
	props: JSX.HTMLElementTags["fieldset"] & DynamicControlProps<T>,
) {
	props = mergeProps(props, arrayRegistry.get(props.schema) ?? {});
	const [controlProps, _, fieldsetProps] = splitProps(
		props,
		["schema", "value", "setValue"],
		["name", "label"],
	);
	const ids = () => props.value.map((_, i) => (i + 1) as Id);

	function swap(i: number) {
		if (i < 0 || i >= props.value.length - 1) return false;
		const arr = [...props.value];
		const tmp = arr[i];
		arr[i] = arr[i + 1];
		arr[i + 1] = tmp;
		props.setValue(arr as any);
		return true;
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

			<DragDropProvider
				onDragEnd={({ draggable, droppable }) => {
					if (draggable && droppable) {
						const currentItems = ids();
						const fromIndex = currentItems.indexOf(draggable.id);
						const toIndex = currentItems.indexOf(droppable.id);
						if (fromIndex !== toIndex) {
							const updatedItems = [...props.value];
							updatedItems.splice(
								toIndex,
								0,
								...updatedItems.splice(fromIndex, 1),
							);
							props.setValue(updatedItems as any);
						}
					}
				}}
				collisionDetector={closestCenter}
			>
				<DragDropSensors />
				<SortableProvider ids={ids()}>
					<Index each={props.value}>
						{(v, i) => (
							<ArrayControlItem
								v={v()}
								i={i + 1}
								swap={swap}
								{...controlProps}
							/>
						)}
					</Index>
				</SortableProvider>

				<DragOverlay>{""}</DragOverlay>
			</DragDropProvider>
		</fieldset>
	);
}

function ArrayControlItem(
	props: DynamicControlProps<any> & {
		swap(i: number): boolean;
		v: any;
		i: number;
	},
) {
	const sortable = (props.i ? createSortable(props.i) : () => {}) as Partial<
		ReturnType<typeof createSortable>
	>;
	const state = useDragDropContext();

	return (
		<div
			class="array-control"
			use:sortable
			classList={{
				"opacity-25": sortable.isActiveDraggable,
				"transition-transform": Boolean(state?.[0].active.draggable),
			}}
		>
			<button
				type="button"
				disabled={props.value.length === 1}
				onKeyDown={(ev) => {
					if (ev.key === "ArrowUp") {
						if (props.swap(props.i - 2)) {
							const button = ev.currentTarget.parentElement
								?.previousElementSibling?.firstElementChild as
								| HTMLButtonElement
								| undefined;
							button?.focus?.();
						}
					} else if (ev.key === "ArrowDown") {
						if (props.swap(props.i - 1)) {
							const button = ev.currentTarget.parentElement?.nextElementSibling
								?.firstElementChild as HTMLButtonElement | undefined;
							button?.focus?.();
						}
					}
				}}
			>
				≡
			</button>
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
