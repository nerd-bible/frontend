// import { Sources } from "./Sources";
// import { createForm, customRegistry, textRegistry } from "./forms/index";
// import * as z from "zod";

// const mySchema = z.object({
// 	name: z
// 		.string()
// 		.register(textRegistry, { label: "NAME", description: "xd" }),
// 	age: z.number().min(0).max(120),
// });

export function Settings() {
	// const [Controls, data] = createForm(mySchema);
	//
	// return (
	// 	<form
	// 		onSubmit={(ev) => {
	// 			ev.preventDefault();
	// 			console.log(data);
	// 		}}
	// 	>
	// 		<Controls />
	// 		<input type="submit" />
	// 	</form>
	// );

	return <div>settings</div>;
}
