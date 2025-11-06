import { Route, Router } from "@solidjs/router";
// import { invoke, isTauri } from "@tauri-apps/api/core";
// import { ConLLUEditor } from "./ConLLU";
import { Home } from "./Home";
import { rtl, locale } from "./i18n";
import { createEffect } from "solid-js";
import { theme } from "./components/ThemePicker";
// import { Settings } from "./Settings";

function App() {
	// async function greet() {
	// 	if (isTauri()) setGreetMsg(await invoke("greet", { name: name() }));
	// }
	createEffect(() => {
		const l = locale();
		document.documentElement.lang = l;
		document.documentElement.dir = rtl.has(l) ? "rtl" : "ltr";
	});
	createEffect(() => (document.documentElement.className = theme()));

	return (
		<Router>
			<Route path="/" component={Home} />
			{/* <Route path="/conllu" component={ConLLUEditor} /> */}
			{/* <Route path="/settings" component={Settings} /> */}
		</Router>
	);
}

export default App;
