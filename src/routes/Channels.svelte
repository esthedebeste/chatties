<script lang="civet">
	{ currentChannel, joinedChannels, leaveChannel } from $lib/api/index.civet
	Username from $lib/chat/Username.svelte

	function keydown(event: KeyboardEvent)
		return unless event.ctrlKey
		if event.shiftKey
			// move channels with ctrl+shift+left/right
			if event.ctrlKey && event.shiftKey && event.code === "ArrowLeft"
				joinedChannels.update (channels) =>
					index := channels.indexOf $currentChannel
					if index > 0
						channels.splice index - 1, 0, channels.splice(index, 1)[0]
					else if index === 0
						first := channels.shift()
						if first then channels.push first
					channels

			else if event.ctrlKey && event.shiftKey && event.code === "ArrowRight"
				joinedChannels.update (channels) =>
					index := channels.indexOf $currentChannel
					if index < channels.length - 1
						channels.splice index + 1, 0, channels.splice(index, 1)[0]
					else if index === channels.length - 1
						last := channels.pop()
						if last then channels.unshift last
					channels
		else
			// move between channels with ctrl+left/right
			if (event.code === "ArrowLeft")
				channels := $joinedChannels
				index := channels.indexOf $currentChannel
				$currentChannel = channels.at index - 1
			else if (event.code === "ArrowRight")
				channels := $joinedChannels
				index := channels.indexOf $currentChannel
				$currentChannel = if index < channels.length - 1 then channels[index + 1] else channels[0]


	// evenly distribute channels across rows
	let chTester: HTMLDivElement | undefined
	$: chWidth = if chTester then Number getComputedStyle(chTester).width else 8
	$: maxChannelLen = 5 + Math.max ...$joinedChannels.map .length
	$: windowWidth = window.innerWidth
	$: rows = Math.ceil ($joinedChannels.length * maxChannelLen * chWidth) / windowWidth
	let channelsPerRow: number
	$: channelsPerRow = $joinedChannels.length / rows
	$: channelsPerRow = if channelsPerRow <= 1.618_033_988_75 then 1 else Math.ceil channelsPerRow
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
