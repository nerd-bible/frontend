import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
} from "@floating-ui/dom";
import type * as z from "@nerd-bible/valio";
import { createEffect, createSignal, type JSX } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import { DynamicControl } from "./controls/Dynamic";

export const padding = (n: number) => {
	const computedStyle = getComputedStyle(document.documentElement);
	const rems = computedStyle.getPropertyValue("--spacing");
	return (
		Number.parseFloat(rems) * Number.parseFloat(computedStyle.fontSize) * n
	);
};

export function Form<T extends z.Pipe>(
	props: JSX.HTMLElementTags["form"] & {
		schema: T;
		value: Store<z.Output<T>>;
		setValue: SetStoreFunction<z.Output<T>>;
	},
) {
	const [errors, setErrors] = createSignal<z.$ZodError<T>[]>([]);

	let input!: HTMLDivElement;
	let tooltip!: HTMLDivElement;
	let arrowEle!: HTMLDivElement;

	createEffect(() => {
		if (!input || !tooltip || !arrowEle) return;

		return autoUpdate(input, tooltip, () =>
			computePosition(input, tooltip, {
				placement: "bottom",
				middleware: [
					offset(padding(3)),
					flip(),
					shift({ padding: padding(4) }),
					arrow({ element: arrowEle }),
				],
			}).then(({ x, y, placement, middlewareData }) => {
				Object.assign(tooltip.style, {
					left: `${x}px`,
					top: `${y}px`,
				});

				if (middlewareData.arrow) {
					const staticSide = {
						top: "bottom",
						right: "left",
						bottom: "top",
						left: "right",
					}[placement.split("-")[0] as "top"];

					Object.assign(arrowEle.style, {
						left: `${middlewareData.arrow.x}px`,
						top: `${middlewareData.arrow.y}px`,
						right: "",
						bottom: "",
						[staticSide]: "-4px",
					});
				}
			}),
		);
	});

	createEffect(() => {
		const validation = props.schema.decode(props.value);
		console.log(validation.error?.issues);
		setErrors(
			validation.error?.issues
				?.filter((issue) => issue.path.length === 0)
				?.map((issue) => issue.message) ?? [],
		);
	});

	return (
		<form novalidate onSubmit={(ev) => ev.preventDefault()} {...props}>
			<DynamicControl
				schema={props.schema}
				value={props.value}
				setValue={props.setValue}
				errors={errors()}
			/>
			{props.children}
		</form>
	);
}
