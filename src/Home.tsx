import * as z from "zod";
import { createForm } from "./forms";

const schema = z
	.object({
		subject: z.number().min(1),
		role: z.object({
			owner: z.number(),
			stranger: z.number(),
		}),
	})
	.refine(
		(data) =>
			data.subject !== 1 || (data.subject === 1 && data.role.owner === 2),
		{
			message: "Owner must be 2 when subject equals 1",
			path: ["role", "owner"],
		},
	);

export function Home() {
	return <ul>
		<li><a href="/conllu">Conllu</a></li>
		<li><a href="/settings">Settings</a></li>
	</ul>
}
