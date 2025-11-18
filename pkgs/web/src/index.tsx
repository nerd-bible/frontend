/* @refresh reload */

import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { IntlProvider } from "./i18n";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";

const App = () => (
	<IntlProvider>
		<Layout>
			<Router>
				<Route path="/" component={Home} />
				<Route path="/settings" component={Settings} />
			</Router>
		</Layout>
	</IntlProvider>
);

render(App, document.body);
