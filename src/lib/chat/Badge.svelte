<script lang="civet">
	Emote from ./Emote.svelte

	export let source: string
	export let name: string
	export let extra: string
</script>

<Emote {source} {name} {extra} height="1em" width="1em" verticalAlign="baseline" />
