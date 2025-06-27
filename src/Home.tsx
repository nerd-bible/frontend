import { useDragDropContext } from "@thisbeyond/solid-dnd";
import {
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
	createSortable,
	closestCenter,
} from "@thisbeyond/solid-dnd";
import { createSignal, Index, Show } from "solid-js";

const Sortable = (props) => {
	const sortable = (props.id ? createSortable(props.id) : () => {}) as Partial<
		ReturnType<typeof createSortable>
	>;
	const state = useDragDropContext();

	return (
		<div
			use:sortable
			class="sortable"
			classList={{
				"opacity-25": sortable.isActiveDraggable,
				"transition-transform": Boolean(state?.[0].active.draggable),
			}}
		>
			{props.item.a}
		</div>
	);
};

type Item = {
	a: string;
};

export const SortableVerticalListExample = () => {
	const [items, setItems] = createSignal<Item[]>([
		{ a: "a" },
		{ a: "b" },
		{ a: "c" },
	]);
	const [activeItem, setActiveItem] = createSignal<Item>();
	const ids = () => items().map((_, i) => (i + 1) as Id);

	return (
		<DragDropProvider
			onDragStart={({ draggable }) => setActiveItem(items()[+draggable.id - 1])}
			onDragEnd={({ draggable, droppable }) => {
				if (draggable && droppable) {
					const currentItems = ids();
					const fromIndex = currentItems.indexOf(draggable.id);
					const toIndex = currentItems.indexOf(droppable.id);
					console.log("onDragEnd", fromIndex, toIndex);
					if (fromIndex !== toIndex) {
						const updatedItems = items().slice();
						updatedItems.splice(
							toIndex,
							0,
							...updatedItems.splice(fromIndex, 1),
						);
						setItems(updatedItems);
					}
				}
			}}
			collisionDetector={closestCenter}
		>
			<DragDropSensors />
			<div class="column self-stretch">
				<SortableProvider ids={ids()}>
					<Index each={items()}>
						{(item, i) => <Sortable id={i + 1} item={item()} />}
					</Index>
				</SortableProvider>
			</div>
			<DragOverlay>
				<Show when={activeItem()}>
					<Sortable item={activeItem()} />
				</Show>
			</DragOverlay>
		</DragDropProvider>
	);
};

export function Home() {
	return <SortableVerticalListExample />;
	// return <ul>
	// 	<li><a href="/settings">Settings</a></li>
	// 	<li><a href="/components">Components</a></li>
	// </ul>
}
