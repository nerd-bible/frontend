import * as i18n from "@solid-primitives/i18n";
import { createSignal } from "solid-js";

const dict = {
	string: '"{{ input }}" is not a string',
	number: '"{{ input }}" is not a number',
	array: '"{{ input }}" is not an array',
};

export const [t, setT] = createSignal(
	i18n.translator(() => dict, i18n.resolveTemplate),
);
