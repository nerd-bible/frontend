import { mount } from "svelte";
import Main from "./Main.svelte";

// TODO: maybe do this and then subtract from layout's padding-inline-end to
// redeem some space on small width viewports that have large scrollbars
// function scrollbarWidth() {
// 	const div = document.createElement("div");
// 	div.style.overflow = "scroll";
// 	document.body.appendChild(div);
//
// 	const res = div.offsetWidth - div.clientWidth;
// 	document.body.removeChild(div);
//
// 	return res;
// }
//
// document.documentElement.style.setProperty(
// 	"--scrollbar-width",
// 	`${scrollbarWidth()}px`,
// );

mount(Main, { target: document.body });
