import { t } from "./i18n";

export function string(input: any): asserts input is string {
	if (typeof input !== "string") throw new Error(t("string", { input }));
}

export function number(input: any): asserts input is number {
	if (typeof input !== "number") throw new Error(t("number", { input }));
}

export function array<T>(input: any): asserts input is Array<T> {
	if (!Array.isArray(input)) throw new Error(t("array", { input }));
}

