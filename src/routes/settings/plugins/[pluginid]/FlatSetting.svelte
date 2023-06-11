<script lang="civet">
	Boolean from ./Boolean.svelte
	Number from ./Number.svelte
	String from ./String.svelte
	StringEnum from ./StringEnum.svelte

	{ getSetting, setSetting } from $lib/plugins.civet
	export let value: boolean | number | string
	export let setting: {
		type: "boolean" | "number" | "string"
	} | {
		type: "string-enum"
		options: string[]
	}
</script>

{#if setting.type === "boolean"}
	<Boolean bind:value />
{:else if setting.type === "number"}
	<Number bind:value />
{:else if setting.type === "string"}
	<String bind:value />
{:else if setting.type === "string-enum"}
	<StringEnum bind:value options={setting.options} />
{/if}
