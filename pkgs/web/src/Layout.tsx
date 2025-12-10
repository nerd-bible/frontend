import { createSignal, useContext } from "solid-js";
import { Dropdown, hasPopover } from "./components/Dropdown";
import { I18nCtx } from "./i18n/Provider";
import { QuickSettings } from "./QuickSettings";
import { columnWidth, fontSize } from "./settings";

export function Layout(props: {
	children: any;
	classList?: Record<string, boolean>;
}) {
	const t = useContext(I18nCtx);
	const [showHeader, setShowHeader] = createSignal(true);
	let lastScrollTop = 0;
	let closeTimeout: number;

	document.addEventListener("scroll", () => {
		const st = window.scrollY;
		if (st > lastScrollTop && !hasPopover()) {
			setShowHeader(false);
		} else if (st < lastScrollTop) {
			setShowHeader(true);
			clearTimeout(closeTimeout);
			// TODO: add to settings
			closeTimeout = setTimeout(() => setShowHeader(false), 8_000);
		}
		lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
	});

	return (
		<>
		</>
	);
}
