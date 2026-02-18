<script lang="ts">
	const { view }: { view: EditorView } = $props();
</script>
<div class="tooltip">
	<button>
		wowo
	</button>
</div>
<style>
.tooltip {
	position: absolute;
	background: var(--color-bg-300);
	filter: drop-shadow(var(--drop-shadow-xl));
	border-radius: var(--radius-md);
	z-index: 10;

	display: flex;
	gap: --spacing(1);
	padding: --spacing(2);

	/* If need to remove overflow-x hidden on body, add these + inner wrapper element: */
	/* https://stackoverflow.com/questions/9933092/css-prevent-absolute-positioned-element-from-overflowing-body */
	/* right: 0; */
	/* overflow: hidden; */
}
</style>
