import type { Component } from "solid-js";
import * as z from "zod";
import type { ArrayControl } from "./controls/Array";
import type { ObjectControl } from "./controls/Object";
import type { TextControl } from "./controls/Text";

type OmitProps = "schema" | "value" | "setValue" | "hintId";

export const textRegistry = z.registry<
	Omit<Parameters<typeof TextControl>[0], OmitProps>,
	z.ZodString | z.ZodNumber
>();

export const objectRegistry = z.registry<
	Omit<Parameters<typeof ObjectControl>[0], OmitProps>,
	z.ZodObject
>();

export const arrayRegistry = z.registry<
	Omit<Parameters<typeof ArrayControl>[0], OmitProps>,
	z.ZodArray
>();

// TODO: hookup
export const customRegistry = z.registry<{
	component: Component<{ schema: z.$output }>;
}>();
