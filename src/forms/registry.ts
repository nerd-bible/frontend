import * as z from "zod/v4/core";
import type { TextFieldProps } from "./TextField";
import type { JSX } from "solid-js";

export const registry = z.registry<
	{ type: Type, props: Props[type] } | Component<{ schema: z.$output}>
>();
