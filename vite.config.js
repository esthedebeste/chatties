import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import civetPlugin from "vite-plugin-civet"
import { version } from "./package.json"

const prefix = process.env.TAURI_DEBUG ? "dev/" : ":3 "
process.env.VITE_APP_VERSION = prefix + version
export default defineConfig({
	plugins: [
		sveltekit(),
		civetPlugin({
			stripTypes: true,
		}),
	],
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		fs: { strict: false },
	},
	envPrefix: ["VITE_", "TAURI_"],
	build: {
		target: "chrome105",
		minify: process.env.TAURI_DEBUG ? false : "esbuild",
		sourcemap: process.env.TAURI_DEBUG ? "inline" : false,
	},
})
