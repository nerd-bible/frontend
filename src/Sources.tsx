import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import * as v from "valibot";
import { AutoField } from "./components/AutoField";

const gitRepo = v.pipe(
	v.string(),
	v.url(),
	v.regex(/^https?:\/\//),
	v.regex(/#.+/),
);
const git = v.object({
	manuscripts: v.array(gitRepo),
	rawManuscripts: v.array(gitRepo),
});
const rawGit = v.array(
	v.object({
		match: v.pipe(
			v.string(),
			v.nonEmpty(),
			v.custom((input) => {
				if (typeof input === "string") {
					new RegExp(input);
					return true;
				}
				return false;
			}, "Please enter a valid Regex."),
		),
		hosts: v.array(v.pipe(v.string(), v.nonEmpty())),
	}),
);
const sources = v.object({ git, rawGit });

const defaults: v.InferInput<typeof sources> = {
	git: {
		manuscripts: ["https://github.com/nerd-bible/manuscripts#master"],
		rawManuscripts: ["https://github.com/nerd-bible/manuscripts-raw#master"],
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

// const [gitUrls, setGitUrl] = makePersisted(
// 	createStore({
// 		"Raw manuscripts":
// 	}),
// 	{ name: "gitUrls" },
// );

export function Sources() {
	const [settings, setSettings] = createStore(defaults);

	return (
		<form onSubmit={(ev) => ev.preventDefault()}>
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
