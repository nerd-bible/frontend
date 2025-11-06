import plugin from "tailwindcss/plugin";

function mix(value: string, other: string, prop = "background") {
	let color = value;
	let amount = "";
	const split = value.split("/");
	if (split.length === 2) {
		color = split[0].trim();
		amount = `${split[1].trim()}%`;
	}

	return {
		[prop]:
			`color-mix(in oklab, var(--color-${other}), var(--color-${color}) ${amount})`,
	};
}

// TODO: replace after tailwindcss picks native color-mix syntax:
// https://github.com/tailwindlabs/tailwindcss/discussions/14827
export default plugin(({ matchUtilities, theme }) => {
	matchUtilities(
		{
			"bg-mix": (value) => mix(value, "bg"),
			"fg-mix": (value) => mix(value, "fg", "color"),
		},
		{
			values: theme("backgroundColor"),
			type: "any", // "color" statically resolves to @theme instead of dynamic css variable
		},
	);
});
