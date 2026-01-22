let n = 0;
// https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
// https://hawkticehurst.com/2023/11/you-are-probably-using-connectedcallback-wrong/
class Dropdown extends HTMLElement {
	constructor() {
		super();
		/** @type {HTMLDivElement} */
		const content = this.querySelector("div");
		content.id = `dropdown-content-${n++}`;
		/** @type {HTMLButtonElement} */
		this.button = this.querySelector("button");
		this.button.ariaExpanded = false;
		this.button.setAttribute("aria-controls", content.id);
		this.button.addEventListener("click", (ev) => {
			this.toggleAttribute("open");
			ev.stopImmediatePropagation();
		});
		this.addEventListener("blur", this.onBlur, { capture: true });
	}

	static observedAttributes = ["open"];

	attributeChangedCallback(name, _oldValue, newValue) {
		if (name === "open") {
			const open = newValue !== null;
			if (open) {
				this.button.ariaExpanded = true;
			} else {
				this.button.ariaExpanded = false;
			}
		}
	}

	/** @param {MouseEvent} ev */
	onClick = (ev) => {
		if (!this.contains(ev.target)) this.removeAttribute("open");
	};

	/** @param {KeyboardEvent} ev */
	onKeydown = (ev) => {
		if (ev.key === "Escape" && this.hasAttribute("open")) {
			this.removeAttribute("open");
			ev.stopImmediatePropagation();
		}
	};

	/** @param {FocusEvent} ev */
	onBlur = (ev) => {
		if (
			!ev.relatedTarget ||
			!(ev.relatedTarget instanceof Element) ||
			this.contains(ev.relatedTarget)
		)
			return;

		this.removeAttribute("open");
	};

	connectedCallback() {
		document.addEventListener("click", this.onClick);
		document.addEventListener("keydown", this.onKeydown);
	}

	disconnectedCallback() {
		document.removeEventListener("click", this.onClick);
		document.removeEventListener("keydown", this.onKeydown);
	}
}
customElements.define("nb-dropdown", Dropdown);
