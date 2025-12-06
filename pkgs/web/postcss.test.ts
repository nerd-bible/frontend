import { readFileSync } from "node:fs";
import postcss from "postcss";
import myPlugin from "./build/postcss-function.ts";

const css = readFileSync("./src/theme.css", "utf8");

const out = postcss([myPlugin()]).process(css);

console.log(out.warnings())
console.log(out.css);
