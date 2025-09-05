import type * as z from "zod";
import type { JSX, Accessor } from "solid-js";
import { For } from "solid-js";

export function Errors<T extends z.$ZodType>(props: JSX.HTMLElementTags["div"] & {
	errors: Accessor<z.$ZodError<T>[]>;
}) {
	return (
		<div role="tooltip" classList={{ hidden: !props.errors().length }}>
			<ul>
				<For each={props.errors()}>{(e) => <li>{e.message}</li>}</For>
			</ul>
			<div class="arrow" ref={arrowEle} />
		</div>
	);
}
