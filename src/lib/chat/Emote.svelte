<script lang="civet">
	{ tooltip } from $lib/EmoteTooltip.svelte

	export let source: string
	export let name: string
	export let extra: string
	export height: string | undefined .= undefined
	export width: string | undefined .= undefined
	export verticalAlign: string | undefined .= undefined
	let emote: HTMLImageElement
	function hover()
		return unless emote
		tooltip.set {
			name,
			extra,
			emote,
		}

	function unhover()
		tooltip.set undefined

</script>

<img
	src={source}
	alt="{name} "
	style:height
	style:width
	style:vertical-align={verticalAlign}
	bind:this={emote}
	on:pointerover={hover}
	on:pointerout={unhover}
/>

<style>
	img {
		height: 2em;
		vertical-align: middle;
	}
</style>
