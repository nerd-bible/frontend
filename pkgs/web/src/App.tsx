import { Route, Router } from "@solidjs/router";
// import { invoke, isTauri } from "@tauri-apps/api/core";
// import { ConLLUEditor } from "./ConLLU";
import { Home } from "./Home";
// import { Settings } from "./Settings";

function App() {
	// async function greet() {
	// 	if (isTauri()) setGreetMsg(await invoke("greet", { name: name() }));
	// }

	return (
		<Router>
			<Route path="/" component={Home} />
			{/* <Route path="/conllu" component={ConLLUEditor} /> */}
			{/* <Route path="/settings" component={Settings} /> */}
		</Router>
	);
}

export default App;
