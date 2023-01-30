<script lang="ts" context="module">
	import { writable } from "svelte/store"

	export const tooltip = writable<
		| {
				text: string
				x: number
				y: number
		  }
		| undefined
	>(undefined)
</script>

<script lang="ts">
	$: x = $tooltip?.x
	$: y = $tooltip?.y
	let div: HTMLDivElement
	$: if (x && y && div) {
		const rect = div.getBoundingClientRect()
		if (y + rect.height > innerHeight) y -= rect.height + 55
		if (x + rect.width / 2 > innerWidth) x = innerWidth - rect.width / 2 - 15
		if (x - rect.width / 2 < 0) x = rect.width / 2
	}
</script>

{#if $tooltip}
	<div bind:this={div} style:left="{x}px" style:top="{y}px">
		{$tooltip.text}
	</div>
{/if}

<style>
	div {
		position: absolute;
		z-index: 1;
		transform: translateX(-50%);
		white-space: pre-wrap;
		word-wrap: break-word;
		background-color: #fff;
		border-radius: 5px;
		padding: 5px;
		color: #000;
		text-align: center;
		overflow: hidden;
		max-width: 22ch;
	}
</style>
