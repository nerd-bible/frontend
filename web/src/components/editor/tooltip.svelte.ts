import { Plugin } from "prosemirror-state";
import { mount, unmount } from "svelte";
import Tooltip from "./Tooltip.svelte";

export default new Plugin({
	view(view) {
		const props = $state({
			counter: 0,
			view,
		});
		const app = mount(Tooltip, { target: view.dom.parentElement!, props });

		return {
			update(view) {
				props.view = view; // doesn't trigger update cuz svelte is dumb
				props.counter++; // force update
			},
			destroy: () => unmount(app),
		};
	},
});
