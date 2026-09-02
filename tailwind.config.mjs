import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcssPostcss from "@tailwindcss/postcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
	// Restore content path for scanning
	content: [path.resolve(__dirname, "./src/components/**/*.{ts,tsx}")],
	theme: {
		extend: {},
	},
	// Restore PostCSS plugin
	plugins: [tailwindcssPostcss],
	corePlugins: {
		// Disable preflight to avoid conflicts with Obsidian base styles.
		preflight: false,
	},
};
