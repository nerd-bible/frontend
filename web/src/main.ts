import { createVaporApp } from "vue";
import App from "./App.vue";

console.log("Welcome to nerd.Bible");
createVaporApp(App).mount(document.body);

// <i18n>`
// Search = 
// 	.aria-label = Search
// Quick-settings = 
// 	.aria-label = Quick settings
//
// Theme = Theme
// System = System
// Dark = Dark
// Light = Light
// Font-size = Font size
// Column-width = Column width
// Language = Language
// Settings = Settings
// `</i18n>
