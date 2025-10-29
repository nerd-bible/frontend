import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
} from "@floating-ui/dom";
import { conllu } from "@nerd-bible/core";
import {
	createContext,
	createMemo,
	createSignal,
	For,
	type JSX,
	Match,
	Show,
	Switch,
	splitProps,
	useContext,
} from "solid-js";
import { padding } from "../forms/Form";

const parser = conllu.Normal;

type Morpheme = conllu.Row;
type WordParent = {
	FORM?: conllu.Row["FORM"];
	MISC?: conllu.Row["MISC"];
	children: Morpheme[];
};
type Word = Morpheme | WordParent;

const TooltipContext =
	createContext<(ele?: HTMLSpanElement, morpheme?: Morpheme) => void>();

function sentenceWords(sentence: conllu.Sentence) {
	const res: Word[] = [];

	for (let i = 0; i < sentence.rows.length; i++) {
		const row = sentence.rows[i];
		if (typeof row.ID === "string") {
			const split = row.ID.split("-");
			const wordEnd = +split[1];

			let endPos = i + 1;
			for (; endPos < sentence.rows.length; endPos++) {
				const id = sentence.rows[endPos]?.ID;
				if (typeof id !== "number" || id > wordEnd) break;
			}

			res.push({
				FORM: row.FORM,
				MISC: row.MISC,
				children: sentence.rows.slice(i + 1, endPos),
			});
			i = endPos - 1;
		} else if (typeof row.ID === "number") {
			res.push(row);
		}
	}

	return res;
}

function MorphemeComponent(
	props: JSX.HTMLElementTags["span"] & {
		morpheme: Morpheme;
	},
) {
	const [morpheme, rest] = splitProps(props, ["morpheme"]);
	const classList = createMemo(() => {
		const res = rest.classList ?? {};
		if (morpheme.morpheme.UPOS) res[morpheme.morpheme.UPOS] = true;

		return res;
	});

	const value = useContext(TooltipContext);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: point of the app
		<span
			onMouseEnter={(ev) => {
				value?.(ev.currentTarget, morpheme.morpheme);
			}}
			onMouseLeave={() => value?.()}
			classList={classList()}
			{...rest}
		>
			{morpheme.morpheme.FORM}
			{/* <Show when={morpheme.morpheme.MISC?.SpaceAfter === "Yes"}> </Show> */}
		</span>
	);
}

function WordComponent(word: Word) {
	return (
		<Switch>
			<Match when={"children" in word}>
				<span class="word">
					<For each={(word as WordParent).children}>
						{(m) => <MorphemeComponent morpheme={m} />}
					</For>
					<Show when={word.MISC?.SpaceAfter !== "No"}> </Show>
				</span>
			</Match>
			<Match when={true}>
				<MorphemeComponent morpheme={word} />
				<Show when={word.MISC?.SpaceAfter !== "No"}> </Show>
			</Match>
		</Switch>
	);
}

export function ConLLU(props: { children: string }) {
	const parsed = parser.parse(props.children);
	const [tooltip, setTooltip] = createSignal<Morpheme>();

	// sentence by sentence view
	// with or without paragraph punctuation
	// color POS
	// dependency viz
	// createEffect(() => console.log(parsed.issues));

	let tooltipEle!: HTMLDivElement;
	let arrowEle!: HTMLDivElement;

	return (
		<TooltipContext.Provider
			value={(span, morpheme) => {
				if (!span || !morpheme) return setTooltip();

				setTooltip(morpheme);

				autoUpdate(span, tooltipEle, () =>
					computePosition(span, tooltipEle, {
						placement: "bottom",
						middleware: [
							offset(padding(3)),
							flip(),
							shift({ padding: padding(4) }),
							arrow({ element: arrowEle }),
						],
					}).then(({ x, y, placement, middlewareData }) => {
						Object.assign(tooltipEle.style, {
							left: `${x}px`,
							top: `${y}px`,
						});

						if (middlewareData.arrow) {
							const staticSide = {
								top: "bottom",
								right: "left",
								bottom: "top",
								left: "right",
							}[placement.split("-")[0] as "top"];

							Object.assign(arrowEle.style, {
								left: `${middlewareData.arrow.x}px`,
								top: `${middlewareData.arrow.y}px`,
								right: "",
								bottom: "",
								[staticSide]: "-4px",
							});
						}
					}),
				);
			}}
		>
			<div lang="hbo" dir="rtl">
				<For each={parsed.sentences}>
					{(sentence) => (
						<span class="sentence" id={sentence.header.sent_id}>
							<For each={sentenceWords(sentence)}>
								{(word) => WordComponent(word)}
							</For>{" "}
						</span>
					)}
				</For>
			</div>
			<div
				classList={{ hidden: !tooltip() }}
				class="w-max absolute z-1 bg-black"
				role="tooltip"
				ref={tooltipEle}
			>
				<div dir="ltr">
					<pre>{JSON.stringify(tooltip(), null, 2)}</pre>
				</div>
				<div class="absolute rotate-45 w-4 h-4 bg-inherit" ref={arrowEle} />
			</div>
		</TooltipContext.Provider>
	);
}
