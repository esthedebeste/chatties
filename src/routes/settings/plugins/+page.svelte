<script lang="ts">
	import { invoke } from "@tauri-apps/api/tauri"
</script>

<main>
	<h1>Plugins</h1>
	<p>
		To add plugins, put their JS files into the plugin folder.
		<button on:click={() => invoke("open_plugin_dir")}>Open plugin folder</button>
	</p>
</main>

<style>
	main {
		padding: 1ch;
	}

	h1 {
		font-size: 1.5em;
	}

	button {
		display: block;
		color: #fff;
		padding: 0.5ch;
		background-color: #181818;
		text-align: center;
		border: 1px solid #444;
		border-radius: 0.25em;
	}

	button:hover {
		background-color: #222;
	}

	button:active {
		background-color: #333;
	}
</style>
