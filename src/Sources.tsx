// import { makePersisted } from "@solid-primitives/storage";
// import { tauriStorage } from "@solid-primitives/storage/tauri";
import * as z from "zod/v4";
import { createForm, textRegistry } from "./forms";
import { createStore } from "solid-js/store";

const gitRepo = z.object({
	url: z.url({ protocol: /^https?$/ }),
	branch: z.string(),
});
const git = z.object({
	manuscripts: z.array(gitRepo),
});

const rawGit = z.array(
	z.object({
		match: z.string().check(
			z.refine(
				(input) => {
					try {
						new RegExp(input);
						return true;
					} catch {
						return false;
					}
				},
				{ error: "Please enter a valid Regex." },
			),
		),
		hosts: z
			.string()
			.check(z.minLength(1))
			.register(textRegistry, { inputEle: "textarea" }),
	}),
);
const sources = z.object({ git, rawGit });

const defaults: z.output<typeof sources> = {
	git: {
		manuscripts: [
			{
				url: "https://github.com/nerd-bible/manuscripts",
				branch: "master",
			},
		],
	},
	rawGit: [
		{
			match: "https://github.com/(?<user>[^/]+)/(?<repo>.+)(.git)?",
			hosts: [
				"https://ghcdn.githack.com/:user/:repo/-/raw/:ref/:file",
				"https://cdn.statically.io/gh/:user/:repo/:ref/:file",
				"https://raw.githubusercontent.com/:user/:repo/:ref/:file",
			].join("\n"),
		},
		{
			match: "https://gitlab.com/(?<user>[^/]+)/(?<repo>.+)(.git)?",
			hosts: [
				"https://glcdn.githack.com/:user/:repo/-/raw/:ref/:file",
				"https://cdn.statically.io/gl/:user/:repo/:ref/:file",
				"https://gitlab.com/api/v4/projects/:user%2F:repo/repository/files/:file/raw",
			].join("\n"),
		},
	],
};

export function Sources() {
	// const [settings, setSettings] = makePersisted(createStore(defaults), {
	// 	name: "sources",
	// 	storage: tauriStorage(),
	// });
	const [Controls, data] = createForm(sources, createStore(defaults));

	return (
		<form
			onSubmit={(ev) => {
				ev.preventDefault();
				console.log(data);
			}}
		>
			<Controls name="Sources" />
			<input type="submit" />
		</form>
	);
}
