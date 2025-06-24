// import { makePersisted } from "@solid-primitives/storage";
// import { tauriStorage } from "@solid-primitives/storage/tauri";
import { createStore } from "solid-js/store";
import { AutoField } from "./components/AutoField";
import * as z from "zod/v4-mini";

z.config(z.locales.en());

console.log(z.url({ protocol: /^https?$/ }));
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
		hosts: z.array(z.string()).check(z.minLength(1)),
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
			],
		},
		{
			match: "https://gitlab.com/(?<user>[^/]+)/(?<repo>.+)(.git)?",
			hosts: [
				"https://glcdn.githack.com/:user/:repo/-/raw/:ref/:file",
				"https://cdn.statically.io/gl/:user/:repo/:ref/:file",
				"https://gitlab.com/api/v4/projects/:user%2F:repo/repository/files/:file/raw",
			],
		},
	],
};

export function Sources() {
	// const [settings, setSettings] = makePersisted(createStore(defaults), {
	// 	name: "sources",
	// 	storage: tauriStorage(),
	// });
	const [settings, setSettings] = createStore(defaults);

	return (
		<form
			onSubmit={(ev) => {
				ev.preventDefault();
				console.log(new FormData(ev.currentTarget));
			}}
		>
			<AutoField
				name="sources"
				schema={sources}
				value={settings}
				setValue={setSettings}
			/>
			<input type="submit" />
		</form>
	);
}
