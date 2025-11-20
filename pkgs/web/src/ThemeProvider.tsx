import { createEffect } from "solid-js";
import { theme } from "./settings";

export function ThemeProvider(props: { children: any }) {
	createEffect(() => (document.documentElement.classList = theme()));

	return props.children;
}
