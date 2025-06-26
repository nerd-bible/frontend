import * as z from "zod/v4/core";
import type { Component } from "solid-js";
import type { TextControl } from "./controls/Text";
import type { ObjectControl } from "./controls/Object";
import type { ArrayControl } from "./controls/Array";

export const textRegistry = z.registry<
	Omit<Parameters<typeof TextControl>[0], "schema" | "setValue">,
	z.$ZodString | z.$ZodNumber
>();

export const objectRegistry = z.registry<
	Omit<Parameters<typeof ObjectControl>[0], "schema" | "setValue">,
	z.$ZodObject
>();

export const arrayRegistry = z.registry<
	Omit<Parameters<typeof ArrayControl>[0], "schema" | "setValue">,
	z.$ZodArray
>();

export const customRegistry = z.registry<{
	component: Component<{ schema: z.$output }>;
}>();
