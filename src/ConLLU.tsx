import { createSignal } from "solid-js";
import { ConLLU } from "./components/ConLLU";
import gen from "./gen";

export function ConLLUEditor() {
	const [text, setText] = createSignal(gen);

	return (
		<div class="grid grid-cols-2">
			<textarea value={text()} onInput={ev => setText(ev.target.value)} />
			<ConLLU>
				{text()}
			</ConLLU>
		</div>
	);
}
