<script>
import Menu from 'virtual:icons/lucide/menu';
</script>
<div class="loading">
	<div class="book">
		<figure class="page"><Menu /></figure>
		<figure class="page"><Menu /></figure>
		<figure class="page"><Menu /></figure>
		<figure class="page"><Menu /></figure>
	</div>
	<div>{t("loading")}</div>
</div>
<style>
.loading {
	text-align: center;
	animation: fadeIn 1.5s;
	margin: auto;
	/** Create stacking context underneath dropdowns */
	/** https://philipwalton.com/articles/what-no-one-told-you-about-z-index/ */
	/* We would like to put this on <main>, but that makes Chrome devtools unable */
	/* to select elements in <main>. */
	z-index: -10;

	.book {
		border: 4px solid var(--color-fg);
		border-radius: var(--radius-md);
		aspect-ratio: 14 / 9.5;
		perspective: calc(200vw);
		margin: auto;
		/** Prevent overflow from `perspective` during animation. */
		max-width: calc(50vw);
		max-height: calc(80vh - 4rem /** approximate header size */);

		& > .page {
			width: 46%;
			height: 96%;
			border: 2px solid var(--color-fg);
			border-radius: var(--radius-md);
			margin: auto;

			& > :global(svg) {
				width: 100%;
				height: 100%;
				color: var(--color-gray-500);
				opacity: 50%;
			}

			contain: content;
			position: absolute;
			right: 4%;
			top: 2%;
			transform-style: preserve-3d;
			transform-origin: left center;
			animation: pageTurn 1s cubic-bezier(0, 0.39, 1, 0.68) infinite;
			&:nth-child(1) { animation: none; }
			&:nth-child(2) { animation-delay: 0.6s; }
			&:nth-child(3) { animation-delay: 0.45s; }
			&:nth-child(4) { animation-delay: 0.2s; }
		}
	}
}

@keyframes fadeIn {
	0%,
	20% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}

@keyframes pageTurn {
	0% {
		transform: rotateY(0deg);
	}
	40%,
	100% {
		background: var(--color-bg-50);
		transform: rotateY(-180deg);
	}
}
</style>
<l10n lang="en-US">
loading = Loading
</l10n>
<l10n lang="es">
loading = Cargando
</l10n>
