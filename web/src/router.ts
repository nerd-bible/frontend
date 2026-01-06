document.querySelectorAll("a").forEach((a) => {
	a.addEventListener("click", (ev) => {
		ev.preventDefault();
		const t = ev.target as HTMLAnchorElement;
		const url = new URL(t.href);
		console.log("click", url.pathname);
		history.pushState({}, "", url.pathname);
		// window.onpopstate = () => {};
		if (url.pathname === "/settings") {
			const idk = document.querySelector("main")!;
			idk.innerHTML = "settings";
		}
	});
});
