<script lang="civet">
	{ getSetting, setSetting } from $lib/plugins.civet
	import type { Plugin, Setting } from "$types/plugin-api"
	FlatSetting from ./FlatSetting.svelte
	export let setting: Setting
	export let id: string
	export let plugin: Plugin
	type OrArr<T> = T | T[]
	value: OrArr<boolean | number | string> .= getSetting plugin, id

	$: if (value !== null)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- type inference error that might be fixed in a later typescript version
		// @ts-ignore setting.changed's first argument is `never`, but setting.default is `string | number | boolean`. why? idk.
		setting.changed?(value)
		setSetting plugin, id, value
</script>

{#if setting.type === "array"}
	<ul>
		{#each value as _, i(i)}
			<li>
				<FlatSetting setting={setting.item} bind:value={value[i]} />
				<button on:click={() => {
					value.splice(i, 1)
					value = value // let svelte know that the array has changed
				}} title="Remove">X</button>
			</li>
		{/each}
	</ul>
	<button on:click={() => {
		value.push(setting.item.default)
		value = value // let svelte know that the array has changed
	}}>Add</button>
{:else}
	<FlatSetting {setting} bind:value />
{/if}
