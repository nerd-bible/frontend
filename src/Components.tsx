// For developing component library
import { Select } from "./components/Select";

export function Components() {
	return (
		<div>
			<Select
				name="test"
				label="label"
				placeholder="placeholder"
				options={["a", "b", "c"].map((label) => ({ label, value: label }))}
			/>
		</div>
	);
}
