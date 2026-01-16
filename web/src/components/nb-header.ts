import MenuIcon from '~icons/mingcute/menu-line'

function css(s) { return s[0]; }

const className = css`
header {
	display: flex;
	gap: --spacing(4);
	margin: --spacing(2);
	flex-wrap: nowrap;
	justify-content: space-between;
	align-items: center;
	position: sticky;
	transition: top;
	top: 0;
	background: var(--color-bg-50);
	background: color-mix(in srgb, var(--color-bg-50), transparent 4%);

	& > .logo {
		height: 2rem;
		aspect-ratio: 1;
		background-image: url(../../img/logo.svg), url(../../img/logo-32.png);
		background-size: cover;
	}

	& > .search {
		flex: 1;
		display: flex;
		align-items: center;

		& > input {
			height: 100%;
			background: var(--color-bg-100);
			border-radius: var(--radius-md);
			width: 100%;
			padding: --spacing(2);
		}
	}
}`;

class Header extends HTMLElement {
	constructor() {
		super();
		this.innerHTML = `
<header>
	<!-- onPointerMove={() => clearTimeout(closeTimeout)} -->
	<div class="logo"></div>
	<form class="search">
		<input autofocus data-l10n-id="Search" id="search" autocomplete="off">
	</form>
	<nb-dropdown class="options">
		<button data-l10n-id="Quick-settings">
			${MenuIcon}
		</button>
		<div>
			quick settings here so cool yayayayayaya
		</div>
	</nb-dropdown>
</header>
<style>
${className}
</style>
		`;
	}
}

customElements.define("nb-header", Header);
