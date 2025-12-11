import postcss from "postcss";
import config from "./postcss.config.js";

const testCss = `
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

postcss(config)
	.process(testCss)
	.then((result) => {
		console.log(result.css);
	});
