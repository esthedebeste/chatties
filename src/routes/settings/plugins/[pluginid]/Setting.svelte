<script lang="civet">
	{ getSetting, setSetting } from $lib/plugins.civet
	type { Plugin, Setting } from $lib/plugins/plugin-api.civet
	export let setting: Setting
	export let id: string
	export let plugin: Plugin
	value: boolean | number | string .= getSetting plugin, id

	function checkbox(event: Event): void
		value = (event.target as HTMLInputElement).checked

	$: if (value !== null)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- type inference error that might be fixed in a later typescript version
		// @ts-ignore setting.changed's first argument is `never`, but setting.default is `string | number | boolean`. why? idk.
		setting.changed?(value)
		setSetting plugin, id, value

</script>

{#if setting.type === "boolean"}
	<input type="checkbox" checked={value === true} on:change={checkbox} />
{:else if setting.type === "number"}
	<input type="number" bind:value />
{:else if setting.type === "string"}
	<input type="text" bind:value />
{/if}
