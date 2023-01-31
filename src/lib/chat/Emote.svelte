<script lang="ts">
	import { tooltip } from "$lib/EmoteTooltip.svelte"

	export let source: string
	export let name: string
	export let extra: string
	export let height: string | undefined = undefined
	export let width: string | undefined = undefined
	export let verticalAlign: string | undefined = undefined
	let emote: HTMLImageElement
	const hover = () => {
		if (!emote) return
		tooltip.set({
			name,
			extra,
			emote,
		})
	}
	const unhover = () => tooltip.set(undefined)
</script>

<img
	src={source}
	alt={name}
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
