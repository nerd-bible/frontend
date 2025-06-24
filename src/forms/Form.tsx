import type { Store, SetStoreFunction } from "solid-js/store";
import type * as z from "zod/v4/core";
import { AutoField } from "../../components/AutoField";

export function Form<T extends z.$ZodType>(props: {
	schema: T;
	value: Store<z.output<T>>;
	setStore: SetStoreFunction<z.output<T>>;
}) {
	return (
		<form
			onSubmit={(ev) => {
				ev.preventDefault();
			}}
			<AutoField
				name="sources"
				schema={sources}
				value={settings}
				setValue={setSettings}
			/>
			<input type="submit" />
		></form>
	);
}
