import Reader from "./routes/Reader.svelte";
import Catalog from "./routes/Catalog.svelte";
import Main from "./layouts/Main.svelte";
// import Settings from "./layouts/Settings.svelte";
// import Sql from "./routes/settings/Sql.svelte";
// import Storage from "./routes/settings/Storage.svelte";
import { t } from "./l10n.svelte";
import { createRouter, type RouteMeta, type Routes } from "sv-router";
import * as r from "@nerd-bible/ref";

export function titleFromRoute(params: Partial<Record<string, string>>, meta: RouteMeta) {
	let next = "";

	if (params.ref) {
		next += params.ref;
	} else if (params.docId) {
		next += params.docId;
	} else {
		next += (meta as any)?.title;
	}

	next += " - nerd Bible";
	return next;
}

export const routes: Routes = {
	"/:docId": Reader,
	"/:docId/:ref": Reader,
	"/catalog": {
		"/": Catalog,
		meta: { title: t("Catalog") },
	},
	// "/settings": {
	// 	"/sql": {
	// 		"/": Sql,
	// 		meta: { title: t("SQL") },
	// 	},
	// 	"/storage": {
	// 		"/": Storage,
	// 		meta: { title: t("Storage") },
	// 	},
	// 	layout: Settings,
	// 	meta: { title: t("Settings") },
	// },
	layout: Main,
	hooks: {
		beforeLoad(ctx) {
			if (ctx.pathname === "/settings") navigate("/settings/sql");
		},
		afterLoad(ctx) {
			if (ctx.pathname === "/") navigate("/bsb/gen");
		},
	},
};
export const { p, navigate, isActive, route } = createRouter(routes);

export function toUrl(
	ref: r.B & ({ pos: bigint } | { chapter: number; verse?: number }),
) {
	let res = `/${r.book}`;
	if ("pos" in ref) return `${res}?pos=${ref.pos}`;

	res += `?c=${ref.chapter}`;
	if ("verse" in ref) res += `&v=${ref.verse}`;

	return res;
}
