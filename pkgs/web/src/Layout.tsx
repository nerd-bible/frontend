import { createSignal, onCleanup, onMount } from "solid-js";

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
					"flex bg-bg py-2 w-full": true,
					"sticky top-0": showHeader(),
				}}
			>
				<div class="grow" />
				<form
					classList={{
						"w-150 flex items-center p-2": true,
						"bg-mix-[fg/5] rounded-md": true,
						"focus-within:outline-2 focus-within:bg-transparent outline-blue-500": true,
					}}
					onSubmit={(ev) => ev.preventDefault()}
				>
					<span class="icon-[mingcute--search-line] h-full mx-2 text-2xl" />
					<input
						id="search"
						type="search"
						autocomplete="off"
						value="1 Chronicles"
						class="grow outline-none"
					/>
				</form>
				<div class="grow" />
			</div>
			<div class="text-justify m-auto max-w-150 font-serif">{props.children}</div>
		</div>
	);
}
