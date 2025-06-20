import { Select as Kobalte } from "@kobalte/core";
import {
	createEffect,
	createSignal,
	type JSX,
	Show,
	splitProps,
} from "solid-js";

type Option = {
	label: string;
	value: string;
};

type SelectProps = {
	name: string;
	label?: string;
	placeholder?: string;
	options: Option[];
	value?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	ref?: (element: HTMLSelectElement) => void;
	onInput?: JSX.EventHandler<HTMLSelectElement, InputEvent>;
	onChange?: JSX.EventHandler<HTMLSelectElement, Event>;
	onBlur?: JSX.EventHandler<HTMLSelectElement, FocusEvent>;
};

export function Select(props: SelectProps) {
	const [rootProps, selectProps] = splitProps(
		props,
		["name", "placeholder", "options", "required", "disabled"],
		["placeholder", "ref", "onInput", "onChange", "onBlur"],
	);
	const [getValue, setValue] = createSignal<Option>();
	createEffect(() => {
		setValue(props.options.find((option) => props.value === option.value));
	});

	return (
		<Kobalte.Root
			{...rootProps}
			multiple={false}
			value={getValue()}
			onChange={setValue}
			optionValue="value"
			optionTextValue="label"
			validationState={props.error ? "invalid" : "valid"}
			itemComponent={(props) => (
				<Kobalte.Item item={props.item}>
					<Kobalte.ItemLabel>{props.item.textValue}</Kobalte.ItemLabel>
					<Kobalte.ItemIndicator>✓</Kobalte.ItemIndicator>
				</Kobalte.Item>
			)}
		>
			<Show when={props.label}>
				<Kobalte.Label>{props.label}</Kobalte.Label>
			</Show>
			<Kobalte.HiddenSelect {...selectProps} />
			<Kobalte.Trigger>
				<Kobalte.Value<Option>>
					{(state) => state.selectedOption().label}
				</Kobalte.Value>
				<Kobalte.Icon>✓</Kobalte.Icon>
			</Kobalte.Trigger>
			<Kobalte.Portal>
				<Kobalte.Content>
					<Kobalte.Listbox />
				</Kobalte.Content>
			</Kobalte.Portal>
			<Kobalte.ErrorMessage>{props.error}</Kobalte.ErrorMessage>
		</Kobalte.Root>
	);
}
