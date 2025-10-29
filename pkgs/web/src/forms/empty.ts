import type * as z from "zod";

export function empty<T extends z.$ZodType>(schema: T): z.output<T> {
	const def = schema._zod.def;

	switch (def.type) {
		case "string":
			return "" as z.output<T>;
		case "number":
		case "int":
			return 0 as z.output<T>;
		case "boolean":
			return false as z.output<T>;
		case "bigint":
			return BigInt(0) as z.output<T>;
		case "null":
			return null as z.output<T>;
		case "undefined":
			return undefined as z.output<T>;
		case "nan":
			return Number.NaN as z.output<T>;
		case "object": {
			const odef = def as z.$ZodObjectDef;
			const outputObject: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(odef.shape)) {
				outputObject[key] = empty(value);
			}
			return outputObject as z.output<T>;
		}
		case "array": {
			const adef = def as z.$ZodArrayDef;
			return [empty(adef.element)] as z.output<T>;
		}
		case "default": {
			const ddef = def as z.$ZodDefaultDef;
			return ddef.defaultValue as z.output<T>;
		}
		case "optional": {
			const odef = def as z.$ZodOptionalDef;
			return empty(odef.innerType) as z.output<T>;
		}
		case "nullable": {
			const ndef = def as z.$ZodNullableDef;
			return empty(ndef.innerType) as z.output<T>;
		}
		case "date": {
			return new Date() as z.output<T>;
		}
		case "literal": {
			const ldef = def as z.$ZodLiteralDef<any>;
			return ldef.values[0];
		}
		// "symbol" | "void" | "never" | "any" | "unknown" | "record"
		// "file" | "tuple" | "union" | "intersection" | "map" | "set" | "enum"
		// "nonoptional" | "success"
		// "transform" | "default" | "prefault" | "catch" | "pipe"
		// "readonly" | "template_literal" | "promise" | "lazy" | "custom";

		default:
			return undefined as z.output<T>;
	}
}

// containers -> children
// others -> { dirty: boolean; errors: [] }
// type FormState<T> = T extends string | number | Date
// 	? { dirty: boolean; errors: any[] }
// 	: FormState<z.output<T>>;
type FormState = any;

export function formState(shape: any): FormState {
	if (Array.isArray(shape)) return shape.map((s) => formState(s));
	switch (typeof shape) {
		case "string":
		case "number":
		case "bigint":
		case "boolean":
		case "undefined":
			return { dirty: false, errors: [] };
		case "object": {
			const outputObject: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(shape)) {
				if (typeof value === "function") continue;

				outputObject[key] = formState(value);
			}
			return outputObject;
		}
		default:
			throw Error(`unknown shape ${typeof shape}`);
	}
}
