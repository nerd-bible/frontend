import { similarity } from "./jaro-winkler";

function consonants(hebrew: string) {
	return hebrew.replace(/\p{M}/u, ""); // Vowels rarely change meaning.
}

console.log(similarity(consonants("וֹ֙"), consonants("ה֙")));
console.log(similarity(consonants("ךְ"), consonants("יךְ")));
console.log(similarity(consonants("נְטוּ֣וֹת"), consonants("נְטוּי֣וֹת")));
