// import { expect, test } from "bun:test";
// import { readFileSync } from "node:fs";

// function expectRoundtrip(doc: any, serialized: string) {
// 	const parsed = normal.parse(serialized);
//
// 	expect(parsed.issues.length).toBe(0);
// 	expect(parsed.sentences).toEqual(doc);
//
// 	const formatted = formatter.fmt(doc);
// 	expect(formatted).toBe(serialized);
// }

// test("basic", () => {
// 	expectRoundtrip(
// 		[
// 			{
// 				header: { foo: "bar", sent_id: "some", text: "hello0world" },
// 				rows: [
// 					{
// 						ID: 0,
// 						FORM: "hello0",
// 						LEMMA: "hello",
// 						UPOS: "PUNCT",
// 						XPOS: "P",
// 						HEAD: 1,
// 						DEPREL: "root",
// 						FEATS: { a: "b", b: "c" },
// 						MISC: { SpaceAfter: "No" },
// 						DEPS: { 2: "dep1", 3: "dep2" },
// 					},
// 					{ ID: 1, FORM: "world", LEMMA: "world" },
// 				],
// 			},
// 		],
// 		`# foo = bar
// # sent_id = some
// # text = hello0world
// 0	hello0	hello	PUNCT	P	a=b|b=c	1	root	2:dep1|3:dep2	SpaceAfter=No
// 1	world	world	_	_	_	_	_	_	_
//
// `,
// 	);
// });
//
// test("custom sentence text header", () =>
// 	expectRoundtrip(
// 		[
// 			{
// 				header: {
// 					sent_id: "some",
// 					text: "woo",
// 				},
// 				rows: [{ ID: 0, FORM: "world", LEMMA: "world" }],
// 			},
// 		],
// 		`# sent_id = some
// # text = woo
// 0	world	world	_	_	_	_	_	_	_
//
// `,
// 	));

// test("write custom comment delimiters", () => {
// 	const schema = z.object({
// 		header: z.object({
// 			custom1: z
// 				.object({ foo: z.number(), bar: z.number() })
// 				.register(registry, { kv: "==", prop: "||" }),
// 		}),
// 		sentences: sentence
// 			.extend({
// 				header: z.object({
// 					sent_id: z.string(),
// 					text: z.string().optional(),
// 					custom2: z
// 						.object({ foo: z.number(), bar: z.number() })
// 						.register(registry, { kv: "==", prop: "||" }),
// 				}),
// 			})
// 			.array(),
// 	});
// 	const opts: Partial<Opts> = { schema };
//
// 	expectText<z.output<typeof schema>>(
// 		{
// 			header: {
// 				custom1: { foo: 0, bar: 1 },
// 			},
// 			sentences: [
// 				{
// 					header: {
// 						sent_id: "some",
// 						custom2: { foo: 0, bar: 1 },
// 					},
// 					rows: [{ ID: 0, FORM: "world", LEMMA: "world" }],
// 				},
// 			],
// 		},
// 		`# custom1 = foo==0||bar==1
// # sent_id = some
// # custom2 = foo==0||bar==1
// # text = world
// 0	world	world	_	_	_	_	_	_	_
//
// `,
// 		opts,
// 	);
// });
//
// test("write conllup", () => {
// 	const opts: Partial<Opts> = {
// 		schema: doc.extend({
// 			sentences: sentence
// 				.extend({
// 					rows: z
// 						.object({
// 							ID: z.number(),
// 							FORM: z.string(),
// 							CUSTOM: z
// 								.object({ foo: z.string(), bar: z.string })
// 								.register(registry, { kv: "==", prop: "||" }),
// 						})
// 						.array(),
// 				})
// 				.array(),
// 		}),
// 	};
//
// 	expectText(
// 		{
// 			header: {},
// 			sentences: [
// 				{
// 					header: { sent_id: "some" },
// 					rows: [{ ID: "0", FORM: "world" }],
// 				},
// 			],
// 		},
// 		`# global.columns = ID FORM CUSTOM
// # sent_id = some
// # text = world
// 0	world	foo==0||bar==1
//
// `,
// 		opts,
// 	);
// });

// test("read real file", () => {
// 	const gen = readFileSync("/home/thesm/src/nerd-bible/tanach.us/dist/gen.conllu", "utf8");
// 	const parser = new Relaxed(["ID", "FORM", "UPOS", "MISC"]);
//
// 	const sentences = parser.parse(gen);
// 	console.log(sentences);
// });

// fmt.fmt([
// 	{
// 		header: { sent_id: "as" },
// 		rows: [{ ID: 3, FORM: "OK", FEATS: { foo: "bar" } }],
// 	},
// 	{
// 		header: { sent_id: "as" },
// 		rows: [{ ID: 3, FORM: "OK", FEATS: { foo: "bar" } }],
// 	},
// ]);
// process.stdout.write(fmt.res);

// const defaultParser = makeSchema(defaultSchema);
//
// const res = defaultParser.safeParse(
// 	`# sent_id = 1
// # text = They buy and sell books.
// 1	They	they	PRON	PRP	Case=Nom|Number=Plur	2	nsubj	2:nsubj|4:nsubj	_
// 2	buy	buy	VERB	VBP	Number=Plur|Person=3|Tense=Pres	0	root	0:root	_
// 3	and	and	CCONJ	CC	_	4	cc	4:cc	_
// 4	sell	sell	VERB	VBP	Number=Plur|Person=3|Tense=Pres	2	conj	0:root|2:conj	_
// 5	books	book	NOUN	NNS	Number=Plur	2	obj	2:obj|4:obj	SpaceAfter=No
// 6	.	.	PUNCT	.	_	2	punct	2:punct	_
//
// #	sent_id	=	2
// #	text	=	I	have	no	clue.
// 1	I	I	PRON	PRP	Case=Nom|Number=Sing|Person=1	2	nsubj	_	_
// 2	have	have	VERB	VBP	Number=Sing|Person=1|Tense=Pres	0	root	_	_
// 3	no	no	DET	DT	PronType=Neg	4	det	_	_
// 4	clue	clue	NOUN	NN	Number=Sing	2	obj	_	SpaceAfter=No
// 5	.	.	PUNCT	.	_	2	punct	_	_
//
// #	sent_id	=	panc0.s4
// #	text	=	तत	यथनशयत।
// #	translit	=	tat	yathānuśrūyate.
// #	text_fr	=	Voilà	ce	qui	nous	est	parvenu	par	la	tradition	orale.
// #	text_en	=	This	is	what	is	heard.
// 1	तत	तद	DET	_	Case=Nom|PronType=Dem	3	nsubj	_	Translit=tat|LTranslit=tad|Gloss=it
// 2-3	यथनशयत	_	_	_	_	_	_	_	SpaceAfter=No
// 2	यथ	यथ	ADV	_	PronType=Rel	3	advmod	_	Translit=yathā|LTranslit=yathā|Gloss=how
// 3	अनशयत	अन-श	VERB	_	MoMood=Ind|Voice=Passive	0	root	_	Translit=anuśrūyate|LTranslit=anu-śru|Gloss=it-is-heard
// 4	।	।	PUNCT	_	_	3	punct	_	Translit=.|LTranslit=.|Gloss=.
// `,
// );
//
// if (res.success) console.log("good");
// else console.log(z.prettifyError(res.error));
