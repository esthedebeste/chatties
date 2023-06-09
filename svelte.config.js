import staticAdapter from "@sveltejs/adapter-static"
import { vitePreprocess } from "@sveltejs/kit/vite"
import sveltePreprocess from "svelte-preprocess"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		sveltePreprocess({
			civet: {
				tsconfigFile: "./tsconfig.json",
			},
			typescript: {
				tsconfigFile: "./tsconfig.json",
			},
		}),
		vitePreprocess(),
	],
	kit: {
		adapter: staticAdapter({ fallback: "index.html" }),
	},
}

export default config
