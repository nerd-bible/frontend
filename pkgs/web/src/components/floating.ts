// Since popover + popover anchors aren't easy to polyfill

import type {
	ComputePositionConfig,
	ComputePositionReturn,
	ReferenceElement,
} from "@floating-ui/dom";
import { computePosition } from "@floating-ui/dom";
import {
	createEffect,
	createSignal,
	createUniqueId,
	onCleanup,
} from "solid-js";

export interface UseFloatingOptions<
	R extends ReferenceElement,
	F extends HTMLElement,
> extends Partial<ComputePositionConfig> {
	whileMounted?: (
		reference: R,
		floating: F,
		update: () => void,
		// biome-ignore lint/suspicious/noConfusingVoidType: void is a valid return type
	) => void | (() => void);
}

interface UseFloatingState extends Omit<ComputePositionReturn, "x" | "y"> {
	x?: number | null;
	y?: number | null;
	display: string;
}

export interface UseFloatingResult extends UseFloatingState {
	update(): void;
}

export const [floatingId, setFloatingId] = createSignal("");

export function useFloating<R extends ReferenceElement, F extends HTMLElement>(
	reference: () => R | undefined | null,
	floating: () => F | undefined | null,
	options?: UseFloatingOptions<R, F>,
): UseFloatingResult {
	const placement = () => options?.placement ?? "bottom";
	const strategy = () => options?.strategy ?? "absolute";
	const id = createUniqueId();

	const [data, setData] = createSignal<UseFloatingState>({
		x: null,
		y: null,
		placement: placement(),
		strategy: strategy(),
		display: "none",
		middlewareData: {},
	});

	function update() {
		const currentReference = reference();
		const currentFloating = floating();

		if (currentReference && currentFloating) {
			computePosition(currentReference, currentFloating, {
				middleware: options?.middleware,
				placement: placement(),
				strategy: strategy(),
			}).then((currentData) => {
				(currentData as UseFloatingState).display =
					id === floatingId() ? "" : "none";
				setData(currentData as UseFloatingState);
			});
		}
	}

	createEffect(() => {
		const currentReference = reference();

		function onClick(ev: PointerEvent) {
			if (!floating()?.contains(ev.target as Node)) {
				setFloatingId("");
				document.removeEventListener("click", onClick);
			}
		}

		if (currentReference) {
			document.addEventListener("click", onClick);
		}
	});

	createEffect(() => {
		const currentReference = reference();
		const currentFloating = floating();

		options?.middleware;
		placement();
		strategy();

		if (currentReference && currentFloating) {
			if (options?.whileMounted) {
				const cleanup = options.whileMounted(
					currentReference,
					currentFloating,
					update,
				);

				if (cleanup) onCleanup(cleanup);
			} else {
				update();
			}
		}
	});

	return {
		get x() {
			return data().x;
		},
		get y() {
			return data().y;
		},
		get placement() {
			return data().placement;
		},
		get strategy() {
			return data().strategy;
		},
		get middlewareData() {
			return data().middlewareData;
		},
		get display() {
			return data().display;
		},
		update,
	};
}
