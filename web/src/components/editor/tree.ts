import type * as s from "@nerd-bible/schema";
import type { parseBcv } from "@nerd-bible/ref";
import { bsearch } from "../../bsearch.ts";

abstract class Node {
	abstract get pos(): bigint;
}

abstract class Leaf extends Node {
	#pos: bigint;

	constructor(pos: bigint) {
		super();
		this.#pos = pos;
	}

	get pos() {
		return this.#pos;
	}
}

export class Word extends Leaf {
	constructor(pos: bigint, public text: string, public lang?: string) {
		super(pos);
		this.text = text;
		this.lang = lang;
	}
}
export class Chapter extends Leaf {
	constructor(pos: bigint, public number: number) {
		super(pos);
		this.number = number;
	}
}
export class Verse extends Leaf {
	constructor(pos: bigint, public number: number) {
		super(pos);
		this.number = number;
	}
}
export class Outline extends Leaf {
	constructor(
		pos: bigint,
		public level: number,
		public text?: string
	) {
		super(pos);
	}
}
export class Note extends Leaf {
	constructor(
		pos: bigint,
		public isPublisher: boolean,
		public doc: bigint,
	) {
		super(pos);
	}
}
export class Ref extends Leaf {
	constructor(pos: bigint,
	public text: string,
	public ref: ReturnType<typeof parseBcv>,
	) {
		super(pos);
	}
}

export class Range {
	start: bigint;
	startContainer: Container;
	end: bigint;
	endContainer: Container;
	// https://en.wikipedia.org/wiki/Lowest_common_ancestor
	closestParent: Container;

	constructor(root: Container, start: bigint, end: bigint) {
		this.start = start;
		this.startContainer = root;
		this.end = end;
		this.endContainer = root;
		this.closestParent = root;

		let startI = root.findPos(start, "start");
		let endI = root.findPos(end, "end");
		while (true) {
			let shouldBreak = true;;
			if (this.startContainer.children[startI] instanceof Container) {
				startI = this.startContainer.findPos(start, "start");
				shouldBreak = false;
			}
			if (this.endContainer.children[endI] instanceof Container) {
				endI = this.endContainer.findPos(end, "end");
				shouldBreak = false;
			}
			if (this.startContainer === this.endContainer) this.closestParent = this.startContainer;
			if (shouldBreak) break;
		}
	}

	surroundContents(wrapper: Container) {
		const startPos = this.closestParent.findPos(this.start, "start");
		const endPos = this.closestParent.findPos(this.start, "end");
		wrapper.children = this.closestParent.children.splice(startPos, endPos - startPos, wrapper);
	}
}

abstract class Container extends Node {
	children: Node[] = [];

	get pos(): bigint {
		return this.children[0].pos;
	}

	get end(): bigint {
		return this.children.at(-1)!.pos;
	}

	findPos(pos: bigint, seek?: "start" | "end"): number {
		return bsearch(this.children, pos, (l) => l.pos, seek);
	}

	findPosRecurse(pos: bigint): { container: Container, index: number } {
		const index = this.findPos(pos, "start");

		if (this.children[index] instanceof Container) {
			return this.children[index].findPosRecurse(pos);
		}
		return { container: this, index }
	}

	sort() {
		const toIndex = (n: Node) => {
			if (n instanceof Outline) return 1;
			if (n instanceof Chapter) return 2;
			return 0;
		}
		this.children.sort((a: Node, b: Node): number => {
			const aPos = a.pos;
			const bPos = b.pos;

			const diff = aPos - bPos;
			if (diff < 0n) return -1;
			else if (diff > 0n) return 1;

			return toIndex(b) - toIndex(a);
		});
	}
}
export class Paragraph extends Container {
	constructor(
		public props: Record<string, any> = {}
	) {
		super();
	}
}
export class Words extends Container {
	constructor(
		public children: Word[]) { super(); }
}
export class List extends Container {
}
export class Mark extends Container {
	constructor(
	public tag: s.Mark["tag"],
	public props: Record<string, any>,
	) {
		super();
	}
}
export class Doc extends Container {
	parent: undefined;

	constructor(public meta: s.Doc, public children: Node[] = []) {
		super();
	}
}
