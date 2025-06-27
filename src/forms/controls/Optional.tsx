import type * as z from "zod/v4/core";
import { DynamicControl, type DynamicControlProps } from "./Dynamic";

export function OptionalControl<T extends z.$ZodType>(
	props: DynamicControlProps<T>,
) {
	return (
		<DynamicControl
			optional
			{...props}
			schema={(props.schema._zod.def as z.$ZodOptionalDef).innerType}
			// @ts-ignore
			setValue={props.setValue}
		/>
	);
}
