<script lang="ts" context="module">
	import { writable } from "svelte/store"

	export const tooltip = writable<
		| {
				name: string
				extra: string
				emote: HTMLElement
		  }
		| undefined
	>(undefined)
</script>

<script lang="ts">
	let x: number
	let top: string
	let bottom: string
	let element: HTMLDivElement
	$: if ($tooltip && element) {
		const { emote } = $tooltip
		const emoteRect = emote.getBoundingClientRect()
		const rect = element.getBoundingClientRect()
		if (emoteRect.bottom + rect.height > innerHeight) {
			// above the emote
			bottom = window.innerHeight - emoteRect.top + 5 + "px"
			top = ""
		} else {
			// below the emote
			top = emoteRect.bottom + 5 + "px"
			bottom = ""
		}
		if (emoteRect.right + rect.width / 2 > innerWidth) x = innerWidth - rect.width / 2 - 15
		else if (emoteRect.left - rect.width / 2 < 0) x = rect.width / 2
		else x = emoteRect.left + emoteRect.width / 2
	}
</script>

{#if $tooltip}
	<div bind:this={element} style:left="{x}px" style:top style:bottom>
		<b>{$tooltip.name}</b>
		<small>{$tooltip.extra}</small>
	</div>
{/if}

<style>
	div {
		position: absolute;
		z-index: 1;
		transform: translateX(-50%);
		white-space: pre-wrap;
		word-wrap: break-word;
		backdrop-filter: blur(10px);
		background-color: #0002;
		border-radius: 10px;
		color: #fff;
		text-align: center;
		overflow: hidden;
		max-width: 22ch;
		display: flex;
		flex-direction: column;
	}
	b {
		display: block;
		font-size: 1.2em;
		padding: 5px;
		font-weight: 400;
	}
	small {
		display: block;
		border-top: 1px solid #444;
		padding: 5px;
		font-size: inherit;
	}
</style>
