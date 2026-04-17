# browser support

Goal: 99% of global audience (since 2017)

## JS

| feature | 100% year | polyfill |
|---------|-----------|----------|
|[Fetch](https://caniuse.com/fetch)|2017|no|
|[ES6](https://compat-table.github.io/compat-table/es6/)|2017|not easy (babel/ts)|
|[Proxy](https://caniuse.com/proxy) (svelte)|2017|no|
|[Service worker](https://caniuse.com/serviceworkers)|2018|no|
|[Floating UI](https://floating-ui.com/docs/misc#browser-support)|?|?|
|[Intl.Segmenter](https://caniuse.com/wf-intl-segmenter)|2021 (FF 2025)|[yes (2.5MB)](https://github.com/toeverything/intl-segmenter-polyfill-rs)|

## CSS

| feature | 100% year | polyfill |
|---------|-----------|----------|
|[Variables](https://caniuse.com/css-variables)|2017|no|
|[Grid](https://caniuse.com/css-grid)|2017|no|
|[Woff2](https://caniuse.com/woff2)|2017|no|
|[Logical props](https://caniuse.com/css-logical-props)|2019|lang selectors|
|[Focus-within](https://caniuse.com/css-focus-within)|2019|no|

## Browserstack

https://github.com/browserslist/caniuse-lite/tree/main/data/features

Need to test on [Browserstack](https://www.browserstack.com/)

> To participate, users must register their projects, make their code public,
  add an open-source license, add the BrowserStack logo to the project’s GitHub
  page and hyperlink it to the company’s website. Participants must also fill
  out an application form that provides details of their projects.
