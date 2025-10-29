import { patienceDiffPlus } from "./diff";
import chalk from "chalk";

const a = `I am the very model of a modern Major-General,
I've information vegetable, animal, and mineral,
I know the kings of England, and I quote the fights historical,
From Marathon to Waterloo, in order categorical.`;

const b = `I am the very model of a cartoon individual,
I've animation comical, unusual, and whimsical,
I'm quite adept at funny gags, comedic theory I have read,
From wicked puns and stupid jokes to anvils dropped on heads.`;

// const aa = `ויישם לפניו לאכל ויאמר לא אכל עד אם־דברתי דברי ויאמר דבר׃`.replace(
// 	/\p{M}/gu,
// 	"",
// );
// const bb = `ויושם לפניו לאכל ויאמר לא אכל עד אם־דברתי דברי ויאמר דבר׃ `.replace(
// 	/\p{M}/gu,
// 	"",
// );
// // .replace(/[\P{L}--\s]/gv, '') -> remove non-letters, keep spacing
//
// const aaa = `johnny ate an apple.`;
// const bbb = `an apple johnny ate.`;

function tokenize2(t: string): string[] {
	return t.split(/([\p{P}\p{Z}])/gu).filter(Boolean);
}

// const diff = patienceDiffPlus(aaa.split(''), bbb.split(''));
// console.log(tokenize2(a))
const diff = patienceDiffPlus(tokenize2(a), tokenize2(b));

for (const o of diff.tokens) {
	// if (d.bIndex < 0)
	// 	process.stdout.write(chalk.red(d.line))
	// else if (d.aIndex < 0)
	// 	process.stdout.write(chalk.green(d.line))
	// else
	// 	process.stdout.write(d.line);

	if (o.bIndex < 0 && o.moved) {
		process.stdout.write(chalk.bgRed(o.token));
	} else if (o.moved) {
		process.stdout.write(chalk.bgGreen(o.token));
	} else if (o.aIndex < 0) {
		process.stdout.write(chalk.green(o.token));
	} else if (o.bIndex < 0) {
		process.stdout.write(chalk.red(o.token));
	} else {
		process.stdout.write(o.token);
	}
}

console.log();

// const diff = myersDiff("hello", "hetto");
// console.log(printMyersDiff(diff));
