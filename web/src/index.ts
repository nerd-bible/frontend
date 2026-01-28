import { mount } from "svelte";
import Main from "./Main.svelte";
import "./components/nb-dropdown";
import "./components/nb-dropdown.css";

console.log("Welcome to nerd.bible");
mount(Main, { target: document.body });
