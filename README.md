# frontend

Rust Tauri app that is wrapper around a webview with a custom web frontend.

## Why native instead of SPA?

I've decided to version Bible content using Git. This allows users to:
1. Sync with whatever Git servers they trust
2. Choose whatever version of content they prefer (like previous editions of
translations) and see differences between them
3. Easily share content between devices

### Own your files offline

Browsers cannot yet
[manage your file system](https://caniuse.com/native-filesystem-api). They can
create [a virtual file system](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system),
but then exporting it:
1. Is annoying
2. Duplicates data

You could disallow exporting, but then people will try to copy/paste each
document out or share screenshots. This frontend will never be the best for
all textual needs.

### Use Git without a proxy

Even though there are [two](https://github.com/isomorphic-git/isomorphic-git)
[libraries](https://github.com/petersalomonsen/wasm-git) for running Git in a
browser, most Git hosts don't include the required CORS headers to be used from
a different domain than their own. A proxy would work, but:
1. Requires trusting the proxy with user highlights and notes
2. Costs money

### Use Git over SSH

Some source forges only allow SSH. In many cases SSH is easier to configure.
Browsers don't support SSH and likely never will.

### Share data locally

You can host a Git server for other devices to connect to. You can host
a static file server for others to view content.

### Synchronize your settings

Your can choose settings to synchronize between devices.

### No file eviction

Browsers can evict files stored via the [File System API](
https://developer.mozilla.org/en-US/docs/Web/API/File_System_API), which would
result in user data loss.

## Why Tauri?

I believe in web-first development. It can reach the most number of users.
Despite the above shortcomings, I still want to host a web app that works
around the above issues. That means web-first development.

I remain hopeful the above issues will be solved:
- Maybe browsers will eventually relax restrictions like CORS behind a
permissions dialog
- Maybe browsers will allow hosting on 0.0.0.0
- Maybe a Bluetooth spec will be agreed upon

I don't want to ship a browser engine to each OS since it's rather large and
difficult to update. Instead I'd just like a small app that uses some IPC with
a system webview.

There's only two mature options: [Tauri](https://tauri.app/) (Rust) and
[Capacitor](https://capacitorjs.com/) (Mixed). Tauri can target desktop without
a bloated Electron, has better
[governance](https://v2.tauri.app/about/governance/), a better plugin API, and
people-centric values rather than profit-centric ones.

Rust is better than a mixing Swift and Kotlin/Java for the non-webview
portions.

## Why Solid?

I like JSX and it has better state management than React.
