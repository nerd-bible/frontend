# browser support

Goal: support 99% of users with a consistent experience. Sadly, this is far off.

https://github.com/browserslist/caniuse-lite/tree/main/data/features

https://github.com/rstacruz/details-polyfill/blob/master/index.js

## HTML

Do not use native `<input>` types.

## JS

- [ES6](https://compat-table.github.io/compat-table/es6/)
- Web workers (with modules)
- [Floating UI](https://floating-ui.com/docs/misc#browser-support)
- Promises
- Fetch
- Proxy (solidjs mergeProps)

## CSS

- align-[start,end]
- woff2
- font weight
- variable font
- focus-within

# Getting there

There exists `babel-preset-env` for JS and `postcss-preset-env`/`lightningcss`
for CSS, but configuration is difficult. What polyfills should be included? How
should imports work? Where should they be included in the build? What's the
point of fast bundlers if you're just going to pipe them through `babel` and
`postcss` anyways? Can we setup [Browserstack](https://www.browserstack.com/)
tests?

## Browserstack

> To participate, users must register their projects, make their code public, add an open-source license, add the BrowserStack logo to the project’s GitHub page and hyperlink it to the company’s website. Participants must also fill out an application form that provides details of their projects.
