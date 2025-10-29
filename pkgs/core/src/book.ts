export type Detail = {
	/** Approximate date book author started writing book. */
	from?: string;
	/** Approximate date book author finished writing book. */
	to?: string;
};

/**
 * All supported books in a popular canon.
 *
 * https://www.biblegateway.com/learn/bible-101/about-the-bible/when-was-the-bible-written/
 */
export const details = {
	gen: { from: "-1446", to: "-1406" } as Detail,
	exo: { from: "-1446", to: "-1406" } as Detail,
	lev: { from: "-1446", to: "-1406" } as Detail,
	num: { from: "-1446", to: "-1406" } as Detail,
	deu: { from: "-1446", to: "-1406" } as Detail,
	jos: { from: "-1400", to: "-1370" } as Detail,
	jdg: { from: "-1045", to: "-1000" } as Detail,
	rut: { from: "-1011", to: "-931" } as Detail,
	"1sa": { from: "-930", to: "-722" } as Detail,
	"2sa": { from: "-930", to: "-722" } as Detail,
	"1ki": { from: "-560", to: "-540" } as Detail,
	"2ki": { from: "-560", to: "-540" } as Detail,
	"1ch": { from: "-450", to: "-425" } as Detail,
	"2ch": { from: "-450", to: "-425" } as Detail,
	ezr: { from: "-440", to: "-430" } as Detail,
	neh: { from: "-430", to: "-400" } as Detail,
	est: { from: "-400" } as Detail,
	job: { from: "-1000", to: "-500" } as Detail,
	psa: { from: "-1400", to: "-500" } as Detail,
	pro: { from: "-950", to: "-700" } as Detail,
	ecc: { from: "-935" } as Detail,
	sng: { from: "-960", to: "-931" } as Detail,
	isa: { from: "-700", to: "-681" } as Detail,
	jer: { from: "-626", to: "-585" } as Detail,
	lam: { from: "-586" } as Detail,
	ezk: { from: "-593", to: "-571" } as Detail,
	dan: { from: "-530" } as Detail,
	hos: { from: "-750", to: "-715" } as Detail,
	jol: { from: "-500", to: "-450" } as Detail,
	amo: { from: "-760", to: "-750" } as Detail,
	oba: { from: "-580", to: "-560" } as Detail,
	jon: { from: "-790", to: "-760" } as Detail,
	mic: { from: "-735", to: "-700" } as Detail,
	nam: { from: "-663", to: "-612" } as Detail,
	hab: { from: "-612", to: "-589" } as Detail,
	zep: { from: "-640", to: "-609" } as Detail,
	hag: { from: "-520" } as Detail,
	zec: { from: "-520", to: "-480" } as Detail,
	mal: { from: "-440", to: "-430" } as Detail,
	mat: { from: "70" } as Detail,
	mrk: { from: "64", to: "70" } as Detail,
	luk: { from: "62", to: "90" } as Detail,
	jhn: { from: "90", to: "110" } as Detail,
	act: { from: "62", to: "90" } as Detail,
	rom: { from: "56", to: "57" } as Detail,
	"1co": { from: "53", to: "54" } as Detail,
	"2co": { from: "55", to: "56" } as Detail,
	gal: { from: "50", to: "56" } as Detail,
	eph: { from: "60", to: "62" } as Detail,
	php: { from: "54", to: "62" } as Detail,
	col: { from: "57", to: "62" } as Detail,
	"1th": { from: "50", to: "51" } as Detail,
	"2th": { from: "51", to: "52" } as Detail,
	"1ti": { from: "62", to: "64" } as Detail,
	"2ti": { from: "64", to: "67" } as Detail,
	tit: { from: "62", to: "64" } as Detail,
	phm: { from: "54", to: "62" } as Detail,
	heb: { from: "60", to: "95" } as Detail,
	jas: { from: "45", to: "62" } as Detail,
	"1pe": { from: "60", to: "65" } as Detail,
	"2pe": { from: "65", to: "68" } as Detail,
	"1jn": { from: "85", to: "100" } as Detail,
	"2jn": { from: "85", to: "100" } as Detail,
	"3jn": { from: "85", to: "100" } as Detail,
	jud: { from: "65", to: "80" } as Detail,
	rev: { from: "64", to: "65" } as Detail,
	// Here lie the not so popular canons...
	tob: {} as Detail,
	jdt: {} as Detail,
	esg: {} as Detail,
	wis: {} as Detail,
	sir: {} as Detail,
	bar: {} as Detail,
	lje: {} as Detail,
	s3y: {} as Detail,
	sus: {} as Detail,
	bel: {} as Detail,
	"1ma": {} as Detail,
	"2ma": {} as Detail,
	"3ma": {} as Detail,
	"4ma": {} as Detail,
	"1es": {} as Detail,
	"2es": {} as Detail,
	man: {} as Detail,
	ps2: {} as Detail,
	oda: {} as Detail,
	pss: {} as Detail,
	eza: {} as Detail,
	"5ez": {} as Detail,
	"6ez": {} as Detail,
	dag: {} as Detail,
	ps3: {} as Detail,
	"2ba": {} as Detail,
	lba: {} as Detail,
	jub: {} as Detail,
	eno: {} as Detail,
	"1mq": {} as Detail,
	"2mq": {} as Detail,
	"3mq": {} as Detail,
	rep: {} as Detail,
	"4ba": {} as Detail,
	lao: {} as Detail,
} as const;

/**
 * [Lowercase Paratext ID](https://ubsicap.github.io/usfm/identification/books.html)
 */
export const ids = [
	"frt",
	"bak",
	"oth",
	"int",
	"cnc",
	"glo",
	"tdx",
	"ndx",
	...(Object.keys(details) as (keyof typeof details)[]),
] as const;
export type Id = (typeof ids)[number];

/**
 * Eagerly match an English book name to an ID.
 *
 * @param eng English book name
 */
export function fromEnglish(eng: string): Id {
	eng = eng.toLowerCase();
	const numeric = eng.replace(
		/\b(the|book|letter|epistle|of|paul|to)\b|-/gi,
		"",
	);
	const norm = numeric
		.replace(
			/[0-9]|\b(ii|iii|iv|v|vi|first|second|third|fourth|fifth|sixth)\b/gi,
			"",
		)
		.replace(/\s+/g, "");

	const found = (Object.keys(details) as Id[]).find((b) => b === numeric);
	if (found) return found;

	if (norm.includes("gen")) return "gen";
	if (norm.includes("exo")) return "exo";
	if (norm.includes("lev")) return "lev";
	if (norm.includes("num")) return "num";
	if (norm.includes("deu")) return "deu";
	if (norm.includes("jos")) return "jos";
	if (norm.includes("judg")) return "jdg";
	if (norm.includes("rut")) return "rut";
	if (norm.includes("sa")) {
		if (startsNumber(numeric, 2)) return "2sa";
		return "1sa";
	}
	if (norm.includes("ki") || norm.startsWith("kg")) {
		if (startsNumber(numeric, 4)) return "2ch";
		if (startsNumber(numeric, 3)) return "1ch";
		if (startsNumber(numeric, 2)) return "2ki";
		return "1ki";
	}
	if (norm.includes("ch")) {
		if (startsNumber(numeric, 2)) return "2ch";
		return "1ch";
	}
	if (norm.includes("ezr")) return "ezr";
	if (norm.includes("neh")) return "neh";
	if (norm.includes("est")) return "est";
	if (norm.includes("job")) return "job";
	if (norm.includes("ps") && !norm.includes("solo")) {
		if (startsNumber(numeric, 3)) return "ps2";
		if (startsNumber(numeric, 2)) return "ps3";
		return "psa";
	}
	if (norm.includes("pr")) return "pro";
	if (norm.includes("ecc") || norm.startsWith("qoh")) return "ecc";
	if (
		(norm.includes("song") || norm.startsWith("cant")) &&
		!norm.includes("young")
	)
		return "sng";
	if (norm.includes("isa")) return "isa";
	if (norm.includes("jer") && !eng.includes("letter")) return "jer";
	if (norm.includes("lam")) return "lam";
	if (norm.includes("eze")) return "ezk";
	if (norm.includes("dan")) {
		if (norm.includes("g")) return "dag"; // daniel greek
		return "dan";
	}
	if (norm.includes("hos")) return "hos";
	if (norm.includes("joe")) return "jol";
	if (norm.includes("am")) return "amo";
	if (norm.includes("oba")) return "oba";
	if (norm.includes("jon")) return "jon";
	if (norm.includes("mic")) return "mic";
	if (norm.includes("na")) return "nam";
	if (norm.includes("hab")) return "hab";
	if (norm.includes("zep")) return "zep";
	if (norm.includes("hag")) return "hag";
	if (norm.includes("zec")) return "zec";
	if (norm.includes("mal")) return "mal";
	if (norm.includes("mat")) return "mat";
	if (norm.includes("mar")) return "mrk";
	if (norm.includes("luk")) return "luk";
	if (norm.includes("act")) return "act";
	if (norm.includes("rom")) return "rom";
	if (norm.includes("co")) {
		if (startsNumber(numeric, 2)) return "2co";
		if (startsNumber(numeric, 1)) return "1co";
	}
	if (norm.includes("gal")) return "gal";
	if (norm.includes("eph")) return "eph";
	if (norm.includes("philip")) return "php";
	if (norm.includes("co")) return "col";
	if (norm.includes("th")) {
		if (startsNumber(numeric, 2)) return "2th";
		return "1th";
	}
	if (norm.includes("tit")) return "tit";
	if (norm.includes("ti")) {
		if (startsNumber(numeric, 2)) return "2ti";
		return "1ti";
	}
	if (norm.includes("phile") || norm === "phlm") return "phm";
	if (norm.includes("heb")) return "heb";
	if (norm.includes("ja")) return "jas";
	if (norm.includes("pe")) {
		if (startsNumber(numeric, 2)) return "2pe";
		return "1pe";
	}
	if (norm.includes("jo") || norm.startsWith("jn") || norm.startsWith("jh")) {
		if (startsNumber(numeric, 3)) return "3jn";
		if (startsNumber(numeric, 2)) return "2jn";
		if (startsNumber(numeric, 1)) return "1jn";
		return "jhn";
	}
	if (norm.includes("jud")) return "jud";
	if (norm.includes("rev")) return "rev";
	// deuterocanonicals
	if (norm.includes("tob")) return "tob"; // tobit
	if (norm.includes("jdt") || norm.startsWith("judi")) return "jdt"; // judith
	if (norm.includes("est")) return "esg"; // esther greek
	if (norm.includes("wis")) return "wis"; // wisdom of solomon
	if (norm.includes("sir")) return "sir"; // sirach
	if (norm.includes("bar")) {
		if (startsNumber(numeric, 4)) return "4ba";
		if (startsNumber(numeric, 2)) return "2ba";
		if (eng.includes("letter")) return "lba"; // letter of baruch
		return "bar"; // baruch
	}
	if (norm.includes("jer")) return "lje"; // letter of jeremiah
	if (norm.includes("song")) return "s3y"; // Song of the 3 Young Men
	if (norm.includes("sus")) return "sus"; // Susanna
	if (norm.includes("bel")) return "bel"; // Bel and the Dragon
	if (norm.includes("ma")) {
		if (startsNumber(numeric, 4)) return "4ma"; // Maccabees
		if (startsNumber(numeric, 3)) return "3ma"; // Maccabees
		if (startsNumber(numeric, 2)) return "2ma"; // Maccabees
		return "1ma";
	}
	if (norm.includes("es")) {
		if (startsNumber(numeric, 2)) return "2es"; // Esdras (Greek)
		return "1es";
	}
	if (norm.includes("man")) return "man"; // Prayer of Manasseh
	if (norm.includes("oda") || norm.startsWith("ode")) return "oda"; // Odae/Odes
	if (norm.includes("ps")) return "pss"; // Psalms of Solomon
	if (norm.includes("ez")) {
		if (startsNumber(numeric, 6)) return "6ez";
		if (startsNumber(numeric, 5)) return "5ez";
		return "eza"; // Ezra Apocalypse
	}
	if (norm.includes("jub")) return "jub"; // Jubilees
	if (norm.includes("eno")) return "eno"; // Enoch
	if (norm.includes("me") || norm.startsWith("mq")) {
		if (startsNumber(numeric, 3)) return "3mq";
		if (startsNumber(numeric, 2)) return "2mq";
		return "1mq"; // Meqabyan/Mekabis
	}
	if (norm.includes("rep")) return "rep"; // Reproof
	if (norm.includes("lao")) return "lao"; // Letter to the Laodiceans

	throw Error(`Unknown book ${norm}`);
}

/** If the book is considered written after 20 AD. */
export function isNewTestament(book: Id): boolean {
	switch (book) {
		case "mat":
		case "mrk":
		case "luk":
		case "act":
		case "rom":
		case "2co":
		case "1co":
		case "gal":
		case "eph":
		case "php":
		case "col":
		case "2th":
		case "1th":
		case "tit":
		case "2ti":
		case "1ti":
		case "phm":
		case "heb":
		case "jas":
		case "2pe":
		case "1pe":
		case "3jn":
		case "2jn":
		case "1jn":
		case "jhn":
		case "jud":
		case "rev":
			return true;
		default:
			return false;
	}
}

function romanize(n: number) {
	const lookup = {
		M: 1000,
		CM: 900,
		D: 500,
		CD: 400,
		C: 100,
		XC: 90,
		L: 50,
		XL: 40,
		X: 10,
		IX: 9,
		V: 5,
		IV: 4,
		I: 1,
	};
	let res = "";
	for (const [k, v] of Object.entries(lookup)) {
		while (n >= v) {
			res += k;
			n -= v;
		}
	}
	return res;
}

const ordinals = {
	1: "first",
	2: "second",
	3: "third",
	4: "fourth",
	5: "fifth",
	6: "sixth",
} as { [n: number]: string };

function startsNumber(s: string, n: number) {
	s = s.trimStart();
	if (s.startsWith(n.toString())) return true;
	if (s.startsWith(romanize(n))) return true;
	if (ordinals[n] && s.startsWith(ordinals[n])) return true;

	return false;
}
