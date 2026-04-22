import Reader from "./routes/Reader.svelte";
import Main from "./layouts/Main.svelte";
import Settings from "./layouts/Settings.svelte";
import Sql from "./routes/settings/Sql.svelte";
import Storage from "./routes/settings/Storage.svelte";
import { t } from "./l10n.svelte";
import { createRouter, type Routes } from "sv-router";

export const routes: Routes = {
	"/:id": Reader,
	"/settings": {
		"/sql": {
			"/": Sql,
			meta: { title: t("SQL") },
		},
		"/storage": {
			"/": Storage,
			meta: { title: t("Storage") },
		},
		layout: Settings,
		meta: { title: t("Settings") },
	},
	layout: Main,
	hooks: {
		beforeLoad(ctx) {
			if (ctx.pathname === "/")
				throw navigate("/:id", { params: { id: "gen" } });
			else if (ctx.pathname === "/settings") throw navigate("/settings/sql");
		},
	},
};
export const { p, navigate, isActive, route } = createRouter(routes);
