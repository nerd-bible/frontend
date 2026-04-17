import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

export const key = new PluginKey("annotate");
export type Annotation = {
	from: number;
	to: number;
	class: string;
};

export type Rules = Record<string, string>;

export type State = {
	decorations: DecorationSet;
	overlaps: Set<string>;
	classes: Record<string, Rules>;
};

export default new Plugin<State>({
	key,
	state: {
		init() {
			return {
				decorations: DecorationSet.empty,
				overlaps: new Set(),
				classes: {},
			};
		},
		apply(tr, oldState) {
			let { decorations } = oldState;
			decorations = decorations.map(tr.mapping, tr.doc);
			const overlaps = structuredClone(oldState.overlaps);
			let classes = oldState.classes;

			const newClasses: Record<string, Rules> = tr.getMeta("annotationClasses");
			if (newClasses) {
				// console.log("apply", newClasses);
				classes = newClasses;
			}

			const annotation: Annotation = tr.getMeta("annotate");
			if (annotation) {
				const { from, to } = annotation;
				const makeDeco = (from: number, to: number) =>
					Decoration.inline(
						from,
						to,
						{ class: annotation.class },
						{
							inclusiveStart: false,
							inclusiveEnd: false,
							class: annotation.class,
						},
					);

				const existing = decorations.find(from - 1, to + 1);
				const existingClass = existing
					.filter((d) => d.spec.class === annotation.class)
					.sort((d) => d.from);
				const shouldAdd =
					existingClass.length === 0 ||
					from < existingClass[0].from ||
					to > existingClass[existingClass.length - 1].to;

				if (shouldAdd) {
					decorations = decorations.add(tr.doc, [makeDeco(from, to)]);
					decorations = decorations.remove(existingClass);
				} else {
					// find ranges to delete
					decorations = decorations.add(tr.doc, [
						makeDeco(existingClass[0].from, from),
						makeDeco(to, existingClass[existingClass.length - 1].to),
					]);
					decorations = decorations.remove(existingClass);
				}

				// overlaps
				const overlappingClasses = new Set<string>([annotation.class]);
				if (existing.length) {
					for (const e of existing) overlappingClasses.add(e.spec.class);
					const sorted = overlappingClasses.keys().toArray().sort();
					const className = sorted.join(".");
					overlaps.add(className);
				}
			}

			return { overlaps, decorations, classes };
		},
	},
	view(v) {
		const ele = document.createElement("style");
		v.dom.parentElement?.prepend(ele);
		let lastClasses = {};

		function genCss(view: EditorView) {
			const state = key.getState(view.state) as State;
			if (lastClasses === state.classes) return;
			lastClasses = state.classes;

			let css = Object.entries(state.classes)
				.map(
					([k, v]) =>
						`.${k}{${Object.entries(v)
							.map(([k, v]) => `${k}:${v};`)
							.join("")}}`,
				)
				.join("\n");
			const toGradient = (color: string) =>
				`linear-gradient(to left, ${color}, ${color})`;
			css += "\n";
			css += state.overlaps
				.keys()
				.toArray()
				.map(
					(k) =>
						`.${k}{background-image: ${k
							.split(".")
							.map((c) => toGradient(state.classes[c]["background-color"]))
							.join(",")};background-blend-mode: lighten;}`,
				)
				.join("\n");
			ele.innerText = css;
		}
		genCss(v);

		return {
			update(view) {
				genCss(view);
			},
			destroy() {
				ele.remove();
			},
		};
	},
	props: {
		decorations(state) {
			return this.getState(state)?.decorations;
		},
	},
});
