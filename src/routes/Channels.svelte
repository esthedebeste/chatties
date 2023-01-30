<script lang="ts">
	import { getContext } from "svelte"
	import type { Writable } from "svelte/store"
	import { joinedChannels, leaveChannel } from "$lib/api"
	import Username from "$lib/chat/Username.svelte"

	let currentChannel = getContext<Writable<string>>("currentChannel")
	const keydown = (event: KeyboardEvent) => {
		if (!event.ctrlKey) return
		if (event.shiftKey) {
			// move channels with ctrl+shift+left/right
			if (event.ctrlKey && event.shiftKey && event.code === "ArrowLeft") {
				joinedChannels.update(channels => {
					const index = channels.indexOf($currentChannel)
					if (index > 0) channels.splice(index - 1, 0, channels.splice(index, 1)[0])
					else if (index === 0) {
						const first = channels.shift()
						if (first) channels.push(first)
					}
					return channels
				})
			} else if (event.ctrlKey && event.shiftKey && event.code === "ArrowRight") {
				joinedChannels.update(channels => {
					const index = channels.indexOf($currentChannel)
					if (index < channels.length - 1)
						channels.splice(index + 1, 0, channels.splice(index, 1)[0])
					else if (index === channels.length - 1) {
						const last = channels.pop()
						if (last) channels.unshift(last)
					}
					return channels
				})
			}
		} else {
			// move between channels with ctrl+left/right
			if (event.code === "ArrowLeft") {
				const channels = $joinedChannels
				const index = channels.indexOf($currentChannel)
				$currentChannel = index > 0 ? channels[index - 1] : channels[channels.length - 1]
			} else if (event.code === "ArrowRight") {
				const channels = $joinedChannels
				const index = channels.indexOf($currentChannel)
				$currentChannel = index < channels.length - 1 ? channels[index + 1] : channels[0]
			}
		}
	}

	// evenly distribute channels across rows
	let chTester: HTMLDivElement | undefined
	$: chWidth = chTester ? Number.parseFloat(getComputedStyle(chTester).width) : 8
	$: maxChannelLen = Math.max(...$joinedChannels.map(channel => channel.length)) + 5
	$: windowWidth = window.innerWidth
	$: rows = Math.ceil(($joinedChannels.length * maxChannelLen * chWidth) / windowWidth)
	let channelsPerRow: number
	$: channelsPerRow = $joinedChannels.length / rows
	$: channelsPerRow = channelsPerRow <= 1.618_033_988_75 ? 1 : Math.ceil(channelsPerRow)
</script>

<svelte:window on:keydown={keydown} on:resize={() => (windowWidth = window.innerWidth)} />

<div hidden bind:this={chTester} style:width="1ch">0</div>

<form
	style:grid-template-columns="repeat({channelsPerRow}, 1fr)"
	style:grid-template-rows="repeat({rows}, 1fr)"
>
	{#each $joinedChannels as channel (channel)}
		<label>
			<Username important name={channel} login={channel.toLowerCase()} />
			<input tabindex="0" type="radio" bind:group={$currentChannel} value={channel} />
			<button
				type="button"
				on:click|stopPropagation={() => {
					leaveChannel(channel)
					if ($currentChannel === channel) $currentChannel = $joinedChannels[0]
				}}
			>
				X
			</button>
		</label>
	{/each}
</form>

<style>
	form {
		display: grid;
		justify-content: center;
		max-width: 100vw;
		padding: 0;
		margin: 0;
	}
	input {
		width: 0;
	}
	label {
		padding: 0.1ch 0.5ch 0.1ch 0.5ch;
		border: 1px solid #777;
		background-color: #111;
		user-select: none;
		display: flex;
		justify-content: space-between;
	}
	label:hover,
	label:has(input:focus) {
		background-color: #222;
		cursor: pointer;
	}
	label:has(input:checked) {
		background-color: #333;
	}
	button {
		aspect-ratio: 1;
		border: none;
		background: none;
	}
	button:hover {
		background-color: #333;
		cursor: pointer;
	}
</style>
