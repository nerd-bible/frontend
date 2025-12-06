import { transformSync } from "@babel/core";

const src = `
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { I18nProvider } from "./i18n";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { ThemeProvider } from "./ThemeProvider";

const App = () => (
	<I18nProvider>
		<ThemeProvider>
			<Layout>
				<Router>
					<Route path="/" component={Home} />
					<Route path="/settings" component={Settings} />
				</Router>
			</Layout>
		</ThemeProvider>
	</I18nProvider>
);

render(App, document.body);
`;

const code = transformSync(src, {
	presets: ["solid"],
});

console.log(code);
