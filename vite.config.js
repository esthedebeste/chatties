import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

const prefix = process.env.TAURI_DEBUG ? "dev/" : ":3 ";
process.env.VITE_APP_VERSION = prefix + require("./package.json").version;
export default defineConfig({
	plugins: [sveltekit()],
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
	},
	envPrefix: ["VITE_", "TAURI_"],
	build: {
		target: "chrome105",
		minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
		sourcemap: process.env.TAURI_DEBUG ? "inline" : false,
	},
});
