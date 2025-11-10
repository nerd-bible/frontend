import { Route, Router } from "@solidjs/router";
// import { invoke, isTauri } from "@tauri-apps/api/core";
// import { ConLLUEditor } from "./ConLLU";
import { Home } from "./Home";
import { IntlProvider } from "./i18n";
import { Layout } from "./Layout";
// import { Settings } from "./Settings";

export default function App() {
	// async function greet() {
	// 	if (isTauri()) setGreetMsg(await invoke("greet", { name: name() }));
	// }

	return (
		<IntlProvider>
			<Layout>
				<Router>
					<Route path="/" component={Home} />
					{/* <Route path="/conllu" component={ConLLUEditor} /> */}
					{/* <Route path="/settings" component={Settings} /> */}
				</Router>
			</Layout>
		</IntlProvider>
	);
}
