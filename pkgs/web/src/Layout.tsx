import { getLocaleDir } from "messageformat/functions";
import { createSignal } from "solid-js";
import { Dropdown, hasPopover } from "./components/Dropdown";
import { locale } from "./i18n";
import { QuickSettings } from "./QuickSettings";
import { columnWidth, fontSize, theme } from "./settings";

export function Layout(props: {
	children: any;
	classList?: Record<string, boolean>;
}) {
	const [showHeader, setShowHeader] = createSignal(true);
	let lastScrollTop = 0;
	let closeTimeout: number;

	return (
		<div
			classList={{
				"text-xl": true,
				"p-4 pt-0": true,
				"[--spacing:0.15rem] sm:[--spacing:0.25rem]": true,
				"bg-bg-50 text-fg leading-none": true,
				"h-dvh overflow-auto": true,
				"dark:not-[.light]:dark text-(--font-size)": true,
				[theme().toLowerCase()]: true,
			}}
			onScroll={(ev) => {
				const st = ev.target.scrollTop;
				if (st > lastScrollTop && !hasPopover()) {
					setShowHeader(false);
				} else if (st < lastScrollTop) {
					setShowHeader(true);
					clearTimeout(closeTimeout);
					// TODO: add to settings
					closeTimeout = setTimeout(() => setShowHeader(false), 8_000);
				}
				lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
			}}
		>
			<header
				lang={locale()}
				dir={getLocaleDir(locale())}
				onPointerOver={() => clearTimeout(closeTimeout)}
				onPointerDown={() => clearTimeout(closeTimeout)}
				classList={{
					"flex bg-bg-50/95 py-4 w-full sticky transition-[top] h-20": true,
					"-top-20": !showHeader(),
					"top-0": showHeader(),
				}}
			>
				<div class="flex-1 content-center">
					<span class="p-2 font-cursive before:content-['nB'] lg:before:content-['nerd.Bible']" />
				</div>
				<form
					classList={{
						"w-132 p-2 flex items-center": true,
						"bg-bg-100 rounded-md": true,
						"focus-within:outline-2 focus-within:bg-transparent outline-focus": true,
					}}
					onSubmit={(ev) => ev.preventDefault()}
				>
					<span class="icon-[mingcute--search-line] mx-2 hidden xs:inline" />
					<input
						id="search"
						type="search"
						autocomplete="off"
						value="1 Chronicles"
						class="grow outline-none w-0"
					/>
				</form>
				<div class="flex-1 content-center flex justify-end [&>button]:border-none">
					<Dropdown button={<span class="icon-[mingcute--menu-line]" />}>
						<QuickSettings />
					</Dropdown>
				</div>
			</header>
			<div
				classList={{
					"m-auto font-serif leading-normal": true,
				}}
				dir="ltr"
				style={{
					"font-size": fontSize(),
					"max-width": columnWidth(),
				}}
			>
				{props.children}
			</div>
		</div>
	);
}
