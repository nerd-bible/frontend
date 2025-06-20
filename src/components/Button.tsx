import clsx from "clsx";
import type { JSX } from "solid-js";

export function Button(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
	props.type ??= "button";

	return (
		<button
			{...props}
			class={clsx("btn", props.class)}
		/>
	);
}
