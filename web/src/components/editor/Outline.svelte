<script lang="ts">
import { settings } from "../../settings.svelte";
import { t } from "../../l10n.svelte";

type Container = [string, (string | Container)[]];
const toc: (string | Container)[] = [
	[
		"The Creation",
		[
			"The First Day",
			"The Second Day",
			"The Third Day",
			"The Fourth Day",
			"The Fifth Day",
			"The Sixth Day",
			"The Seventh Day",
		],
	],
	"Man and Woman in the Garden",
	"The Serpent’s Deception",
	"God Arraigns Adam and Eve",
	"The Fate of the Serpent",
	"The Punishment of Mankind",
	"Cain and Abel",
	"The Descendants of Cain",
	"Seth and Enosh",
	"The Descendants of Adam",
	"God Takes Up Enoch",
	"From Methuselah to Noah",
	"Corruption on the Earth",
	"Noah’s Favor with God",
	"Preparing the Ark",
	"The Great Flood",
	"The Ark Rests on Ararat",
	"Noah Sends a Raven and a Dove",
	"Exiting the Ark",
	"Noah Builds an Altar",
	"The Covenant of the Rainbow",
	"Noah’s Shame and Canaan’s Curse",
	"Shem’s Blessing and Noah’s Death",
	["The Table of Nations", ["The Japhethites", "The Hamites", "The Semites"]],
	"The Tower of Babel",
	"Genealogy from Shem to Abram",
	"Terah’s Descendants",
	"The Call of Abram",
	"Abram and Sarai in Egypt",
	"Abram and Lot Part Ways",
	"Lot Proceeds toward Sodom",
	"God Renews the Promise to Abram",
	"The War of the Kings",
	"Abram Rescues Lot",
	"Melchizedek Blesses Abram",
	"God’s Covenant with Abram",
	"God Confirms His Promise",
	"Hagar and Ishmael",
	"Abraham to Father Many Nations",
	"The Covenant of Circumcision",
	"The Three Visitors",
	"Sarah Laughs at the Promise",
	"Abraham Intercedes for Sodom",
	"Lot Welcomes the Angels",
	"Lot Flees to Zoar",
	"The Destruction of Sodom and Gomorrah",
	"Lot and His Daughters",
	"Abraham: Sarah, and Abimelech",
	"The Birth of Isaac",
	"Sarah Turns against Hagar",
	"The Covenant at Beersheba",
	"The Offering of Isaac",
	"The LORD Provides the Sacrifice",
	"The Sons of Nahor",
	"The Death and Burial of Sarah",
	"A Wife for Isaac",
	"Rebekah Is Chosen",
	"Isaac Marries Rebekah",
	"Abraham and Keturah",
	"The Death of Abraham",
	"The Descendants of Ishmael",
	"Jacob and Esau",
	"Esau Sells His Birthright",
	"God’s Promise to Isaac",
	"Isaac Deceives Abimelech",
	"Isaac’s Prosperity",
	"Isaac’s Covenant with Abimelech",
	"Esau’s Wives",
	"Isaac Blesses Jacob",
	"Esau’s Lost Hope",
	"Jacob’s Departure",
	"Esau Marries Mahalath",
	"Jacob’s Ladder",
	"The Stone of Bethel",
	"Jacob Meets Rachel",
	"Jacob Marries Leah and Rachel",
	"Reuben: Simeon, Levi, and Judah",
	"Dan and Naphtali",
	"Gad and Asher",
	"Issachar: Zebulun, and Dinah",
	"Joseph",
	"Jacob Prospers",
	"Jacob Flees from Laban",
	"Laban Pursues Jacob",
	"Jacob’s Covenant with Laban",
	"Jacob Prepares to Meet Esau",
	"Jacob Wrestles with God",
	"Jacob Meets Esau",
	"Jacob Settles in Shechem",
	"The Defiling of Dinah",
	"The Revenge of Dinah’s Brothers",
	"Jacob Returns to Bethel",
	"Benjamin Born, Rachel Dies",
	"The Sons of Jacob",
	"The Death of Isaac",
	"The Descendants of Esau",
	"The Descendants of Seir",
	"The Kings of Edom",
	"Joseph’s Dreams",
	"Joseph Sold into Egypt",
	"Jacob Mourns Joseph",
	"Judah and Tamar",
	"The Birth of Perez and Zerah",
	"Joseph and Potiphar’s Wife",
	"Joseph Falsely Imprisoned",
	"The Cupbearer and the Baker",
	"The Dreams of Pharaoh",
	"Joseph Interprets Pharaoh’s Dreams",
	"Joseph Given Charge of Egypt",
	"The Seven Years of Plenty",
	"The Famine Begins",
	"Joseph’s Brothers Sent to Egypt",
	"Joseph’s Brothers Return to Canaan",
	"The Return to Egypt with Benjamin",
	"Joseph’s Hospitality to His Brothers",
	"Benjamin and the Silver Cup",
	"Judah Pleads for Benjamin",
	"Joseph Reveals His Identity",
	"Joseph Sends for His Father",
	"Pharaoh Invites Jacob to Egypt",
	"The Revival of Jacob",
	"Jacob’s Journey to Egypt",
	[
		"Those Who Went to Egypt",
		[
			"The Children of Leah",
			"The Children of Zilpah",
			"The Children of Rachel",
			"The Children of Bilhah",
		],
	],
	"Jacob Arrives in Egypt",
	"Jacob Settles in Goshen",
	"The Famine Continues",
	"The Israelites Prosper in Goshen",
	"Jacob Blesses Ephraim and Manasseh",
	"Jacob Blesses His Sons",
	"The Death of Jacob",
	"Mourning and Burial for Jacob",
	"Joseph Comforts His Brothers",
	"The Death of Joseph",
];
</script>

{#snippet outlineItem(item: string | Container | (string | Container)[])}
	{#if Array.isArray(item)}
		<ul>
			{#each item as subitem}
				<li>{@render outlineItem(subitem)}</li>
			{/each}
		</ul>
	{:else}
		<a href="#foo">{item}</a>
	{/if}
{/snippet}

<div class="outline">
	<form>
		<select bind:value={settings.showOutline}>
			<option value="true">Publisher</option>
			<option value="false">{t("None")}</option>
		</select>
	</form>
	<nav>
		{#if settings.showOutline === "true"}
			{@render outlineItem(toc)}
		{/if}
	</nav>
</div>

<style>
form {
	padding: --spacing(2) 0 --spacing(4) 0;
}

form,
select {
	width: 100%;
}

.outline {
	padding: --spacing(4);
	padding-top: 0;
}

nav > ul > li {
	text-indent: --spacing(-2);
	padding-inline-start: --spacing(2);
	& ul ul {
		margin-inline-start: --spacing(4);
	}
}

a {
	color: var(--color-link);
}
</style>
