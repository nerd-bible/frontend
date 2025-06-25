import { DynamicControl } from "./Dynamic";

export function ObjectControl<T extends z.$ZodType>(
	props: TextFieldProps & ControlProps<T>,
) {
	return (
		<fieldset class={props.class}>
			<Show when={props.name}>
				<legend>{props.name}</legend>
			</Show>
			<For each={Object.entries(props.schema._zod.def.shape)}>
				{([name, schema]) => (
					<DynamicControl
						name={name}
						schema={schema}
						value={(props.value as any)[name]}
						setValue={(...args: any[]) =>
							// @ts-ignore
							props.setValue(name as any, ...args)
						}
					/>
				)}
			</For>
		</fieldset>
	);
}
