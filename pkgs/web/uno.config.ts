import presetMini from "@unocss/preset-mini";
import transformerVariantGroup from "@unocss/transformer-variant-group";
import { defineConfig } from "@unocss/vite";

// Put static CSS config here.
export default defineConfig({
	presets: [presetMini({ preflight: false })],
	transformers: [transformerVariantGroup()],
	extendTheme(old) {
		return {
			...old,
			fontFamily: {
				sans: '"Noto Sans", "Noto Sans Hebrew", ui-sans, sans',
				serif:
					'"Noto Serif", "Noto Serif Hebrew", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
				cursive: '"Gloria Hallelujah", cursive',
			},
		};
	},
});
