// import { makePersisted } from "@solid-primitives/storage";
// import { tauriStorage } from "@solid-primitives/storage/tauri";
import * as z from "@nerd-bible/valio";

const sources = z.object({
	manuscripts: z.array(
		z.object({
			url: z.url({ protocol: /^https?$/ }),
			branch: z.string(),
		}),
		// .register(objectRegistry, { class: "git" }),
	),
	// .register(arrayRegistry, { label: "Manuscripts" }),
	rawGit: z.array(
		z.object({
			match: z.string().refine(
				(input) => {
					try {
						new RegExp(input);
						return true;
					} catch {
						return false;
					}
				},
				"regexpSource",
				{},
			),
			hosts: z.string().minLength(1),
			// .register(textRegistry, { inputEle: "textarea" }),
		}),
	),
	// .register(arrayRegistry, { label: "Git mirrors" }),
});

const _defaults: z.Output<typeof sources> = {
	manuscripts: [
		{
			url: "https://github.com/nerd-bible/manuscripts",
			branch: "master",
		},
	],
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
	// const [Form, data] = createForm(sources, createStore(defaults));

	return <form>sources</form>;
}
