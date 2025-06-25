import { Sources } from "./Sources";
import { createForm, registry } from "./forms/index";
import * as z from "zod/v4-mini";

z.config(z.locales.en());

const mySchema = z.object({
	name: z.string().register(registry, { propsOrComponent: { label: "Full name" } }),
	age: z.number().check(z.minimum(0), z.maximum(120)),
});

export function Settings() {
	const [Controls, data] = createForm(mySchema);

	return (
		<form
			onSubmit={(ev) => {
				ev.preventDefault();
				console.log(data)
			}}
		>
			<Controls />
			<input type="submit" />
		</form>
	);

	// return <Sources />;
}
