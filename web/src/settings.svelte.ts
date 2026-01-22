export const locales = {
	"en-US": {
		name: "English",
	},
	// he: {
	// 	name: "עברית",
	// },
	// el: "Ελληνικά",
	es: {
		name: "Español",
	},
};
export type Locale = keyof typeof locales;
export const settings = $state({
	locale: "en-US" as Locale,
});
