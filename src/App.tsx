// import { invoke, isTauri } from "@tauri-apps/api/core";
import { Router, Route } from "@solidjs/router";
import { Settings } from "./Settings";
import { Home } from "./Home";

function App() {
	// async function greet() {
	// 	if (isTauri()) setGreetMsg(await invoke("greet", { name: name() }));
	// }

	return (
		<Router>
			<Route path="/" component={Home} />
			<Route path="/settings" component={Settings} />
		</Router>
	);
}

export default App;
