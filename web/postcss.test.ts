import postcss from "postcss";
import config from "./postcss.config.js";

const testCss = `
@import "@nerd-bible/fonts/dist/faces.css";

@utility thumb-focus {
	outline-offset: --spacing(4);
	outline-width: 4px;
}

input[type="range"] {
	appearance: none;

	&:focus {
		outline: none;
		&::-webkit-slider-thumb { @apply thumb-focus; }
		&::-moz-range-thumb { @apply thumb-focus; }
	}
}`;

postcss(config as any)
	.process(testCss, { from: "a.css" })
	.then((result) => {
		console.log(result.css);
	});
