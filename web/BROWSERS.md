# browser support

Goal: 99% of global audience (since 2017)

## JS

| feature                                                          | 100% year      | polyfill                                                                  |
| ---------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| [Fetch](https://caniuse.com/fetch)                               | 2017           | no                                                                        |
| [ES6](https://compat-table.github.io/compat-table/es6/)          | 2017           | not easy (babel/ts)                                                       |
| [Proxy](https://caniuse.com/proxy) (svelte)                      | 2017           | no                                                                        |
| [Service worker](https://caniuse.com/serviceworkers)             | 2018           | no                                                                        |
| [Floating UI](https://floating-ui.com/docs/misc#browser-support) | ?              | ?                                                                         |
| [Intl.Segmenter](https://caniuse.com/wf-intl-segmenter)          | 2021 (FF 2025) | [yes (2.5MB)](https://github.com/toeverything/intl-segmenter-polyfill-rs) |

### Sqlite persistence

So... sqlite can be compiled to WASM. It has a synchronous VFS impl that needs
overriding from JS.

You can turn async JS synchronous by using SharedArrayBuffer + Atomics.

You can also turn the C code async by using
[Empscripten's asyncify](https://emscripten.org/docs/porting/asyncify.html#asynchronous-code).
This doubles the code size. JSPI also works, but has poor browser support.

Then we need to implement concurrent tabs. Web locks is the ideal way to only
allow one. Those work since 2022.

OPFS is [about 50% faster](https://rhashimoto.github.io/wa-sqlite/demo/benchmarks/?config=default,MemoryVFS;default,OPFSCoopSyncVFS;asyncify,IDBBatchAtomicVFS)
than IndexedDb. Because SQLite is so important to our app, I think it's worth
not supporting browsers between 2022 and 2023.

If we want to support older browsers, we could in theory asyncify

| feature                                                                                                      | 100% year | polyfill |
| ------------------------------------------------------------------------------------------------------------ | --------- | -------- |
| [IndexedDb](https://caniuse.com/indexeddb)                                                                   | 2015      | no       |
| [Wasm](https://caniuse.com/wasm)                                                                             | 2018      | no       |
| [Web lock](https://caniuse.com/mdn-api_navigator_locks)                                                      | 2022      | no       |
| [Atomics](https://caniuse.com/mdn-javascript_builtins_atomics)                                               | 2022      | no       |
| [OPFS](https://caniuse.com/wf-origin-private-file-system)                                                    | 2023      | no       |
| [Shared worker](https://caniuse.com/mdn-api_sharedworker)                                                    | 2023      | no       |
| [SharedArrayBuffer (needs COEP+COOP headers)](https://caniuse.com/mdn-javascript_builtins_sharedarraybuffer) | 2026      | no       |
| [JSPI](https://caniuse.com/wf-wasm-jspi)                                                                     |           | no       |

## CSS

| feature                                                | 100% year | polyfill       |
| ------------------------------------------------------ | --------- | -------------- |
| [Variables](https://caniuse.com/css-variables)         | 2017      | no             |
| [Grid](https://caniuse.com/css-grid)                   | 2017      | no             |
| [Woff2](https://caniuse.com/woff2)                     | 2017      | no             |
| [Logical props](https://caniuse.com/css-logical-props) | 2019      | lang selectors |
| [Focus-within](https://caniuse.com/css-focus-within)   | 2019      | more js        |

## Browserstack

https://github.com/browserslist/caniuse-lite/tree/main/data/features

Need to test on [Browserstack](https://www.browserstack.com/)

> To participate, users must register their projects, make their code public,
> add an open-source license, add the BrowserStack logo to the project’s GitHub
> page and hyperlink it to the company’s website. Participants must also fill
> out an application form that provides details of their projects.
