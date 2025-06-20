// import { invoke, isTauri } from "@tauri-apps/api/core";
import { Router, Route } from "@solidjs/router";
import { Settings } from "./Settings";
import { Show } from "solid-js";
import { Home } from "./Home";
import { Components } from "./Components";

function App() {
	// async function greet() {
	// 	if (isTauri()) setGreetMsg(await invoke("greet", { name: name() }));
	// }

	return (
		<Router>
			<Route path="/" component={Home} />
			<Show when={import.meta.env.DEV}>
				<Route path="/components" component={Components} />
			</Show>
			<Route path="/settings" component={Settings} />
		</Router>
	);
}

export default App;
