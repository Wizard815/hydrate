// Tailwind v4 requires the @tailwindcss/postcss plugin rather than the
// tailwindcss package directly.
import tailwindcssPostcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
	plugins: [
		tailwindcssPostcss({ config: "./tailwind.config.mjs" }), // keep the explicit config path
		autoprefixer,
	],
};
