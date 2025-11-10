import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const inPath = join(import.meta.dir, "./src/i18n/translations.tsv");
const outPath = join(import.meta.dir, "./src/i18n/generated");
const contents = readFileSync(inPath, "utf8");

const translations: Record<string, Record<string, string>> = {};
let header: string[] = [];
for (const line of contents.split(/\r?\n/g)) {
	const cols = line.split("\t");
	if (!header.length) {
		header = cols;
	} else {
		for (let i = 0; i < cols.length; i++) {
			const lang = header[i];
			if (lang === "context") continue;
			translations[lang] ??= {};
			translations[lang][cols[1]] = cols[i];
		}
	}
}

for (const lang in translations) {
	const outPath2 = join(outPath, `${lang}.js`);
	const outDir = dirname(outPath2);

	mkdirSync(outDir, { recursive: true });
	writeFileSync(
		outPath2,
		`export default ${JSON.stringify(translations[lang], null, "\t")};`,
	);
}

// Consumed in `i18n/index.ts`
const indexPath = join(outPath, "index.ts");
writeFileSync(
	indexPath,
	`export type Translation = {
	${Object.entries(translations.en)
		.map(([k, v]) => `"${k}": "${v}"`)
		.join(",\n\t")}
}`,
);
