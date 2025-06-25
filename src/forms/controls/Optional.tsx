import { DynamicControl } from "./Dynamic";

export function OptionalControl<T extends z.$ZodType>(
	props: TextFieldProps & ControlProps<T>,
) {
	return (
		<DynamicControl
			name={props.name}
			schema={(props.schema._zod.def as z.$ZodOptionalDef).innerType}
			value={props.value}
			setValue={props.setValue}
			class={props.class}
		/>
	);
}
