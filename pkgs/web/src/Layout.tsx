import { createSignal, onCleanup, onMount } from "solid-js";
import { Dropdown } from "./components/Dropdown";
import { ThemePicker } from "./components/ThemePicker";

export function Layout(props: { children: any }) {
	const [showHeader, setShowHeader] = createSignal(false);
	let lastScrollTop = 0;
	function onScrollUp() {
		const st = window.pageYOffset || document.documentElement.scrollTop;
		if (st > lastScrollTop) {
			setShowHeader(false);
		} else if (st < lastScrollTop) {
			setShowHeader(true);
		}
		lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
	}

	onMount(() => document.addEventListener("scroll", onScrollUp));
	onCleanup(() => document.removeEventListener("scroll", onScrollUp));

	return (
		<div class="p-4 pt-0">
			<div
				classList={{
					"flex bg-bg/90 py-4 w-full sticky": true,
					"top-0": showHeader(),
				}}
			>
				<div class="flex-1 content-center">
					<span class="p-2 font-cursive before:content-['nB'] lg:before:content-['nerd.Bible']" />
				</div>
				<form
					classList={{
						"w-125 p-2 flex items-center": true,
						"bg-mix-[fg/10] rounded-md": true,
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
				<div class="flex-1 flex justify-end">
					<Dropdown
						class="p-2"
						button={<span class="icon-[mingcute--menu-line] mt-[5px]" />}
					>
						<ThemePicker />
						<span>Sources</span>
					</Dropdown>
				</div>
			</div>
			<div class="text-justify m-auto max-w-150 font-serif leading-normal">
				{props.children}
			</div>
		</div>
	);
}
