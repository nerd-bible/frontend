import { Route, Router } from "@solidjs/router";
// import { invoke, isTauri } from "@tauri-apps/api/core";
// import { ConLLUEditor } from "./ConLLU";
import { Home } from "./Home";
import { IntlProvider } from "./i18n";
import { createEffect } from "solid-js";
import { theme } from "./components/ThemePicker";
// import { Settings } from "./Settings";

function App() {
	// async function greet() {
	// 	if (isTauri()) setGreetMsg(await invoke("greet", { name: name() }));
	// }
	createEffect(() => (document.documentElement.className = theme()));

	return (
		<IntlProvider>
			<Router>
				<Route path="/" component={Home} />
				{/* <Route path="/conllu" component={ConLLUEditor} /> */}
				{/* <Route path="/settings" component={Settings} /> */}
			</Router>
		</IntlProvider>
	);
}

export default App;
