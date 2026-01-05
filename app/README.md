# app

Native and signed x86_64 and ARM apps for the following platforms:
- Desktop
    - Windows (.msi)
    - Linux (.deb -> apt + aur, .snap -> snapcraft, .rpm -> ?)
    - Mac (.app)
- Mobile
    - Android (.apk, .aab -> Google Play)
    - iOS (.pkg -> App Store)

## Why Tauri?

There's only two mature options: [Tauri](https://tauri.app/) (Rust) and
[Capacitor](https://capacitorjs.com/) (Mixed). Tauri can target desktop without
a bloated Electron, has better
[governance](https://v2.tauri.app/about/governance/), a better plugin API, and
people-centric values rather than profit-centric ones.

Rust is better than mixing Swift and Kotlin/Java for the non-webview portions.
