<script lang="civet">
	{ page } from $app/stores
	{ pluginsWithSettings } from $lib/plugins.civet
	Setting from ./Setting.svelte
	$: plugin = pluginsWithSettings().find((plugin) => plugin.id === $page.params.pluginid) ?? throw new Error("plugin not found")
	$: settings = Object.entries plugin.settings ?? {}
</script>

<main>
	<h1>{plugin.id}</h1>
	{#each settings as [id, setting] (`${plugin.id}.${id}`)}
		<!-- svelte-ignore a11y-label-has-associated-control - the control is in Setting -->
		<label>
			{setting.name}
			<Setting {plugin} {id} {setting} />
		</label>
	{/each}
</main>


<style>
	main {
		padding: 1ch;
	}
	h1 {
		font-size: 1.5em;
	}
	label {
		display: block;
		margin: 1ch 0;
	}
</style>
