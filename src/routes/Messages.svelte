<script lang="civet">
	{ channelIds, currentChannel, messageStore, setChannelId } from $lib/api/index.civet
	JoinMessage from $lib/chat/JoinMessage.svelte
	PartMessage from $lib/chat/PartMessage.svelte
	PrivMessage from $lib/chat/PrivMessage.svelte
	{ getSetting } from $lib/plugins.civet
	{ onMount } from svelte
	{ plugin as twitchNativePlugin } from $lib/plugins/twitch-native.civet
	let messageElement: HTMLUListElement

	function scrollDown(force = false)
		return unless messageElement
		atBottom := messageElement.scrollTop + messageElement.clientHeight >= messageElement.scrollHeight - 30 // 30px buffer
		if force || atBottom
			setTimeout => messageElement.scroll 0, messageElement.scrollHeight // scroll to bottom again to account for the new message

	$: currentChannelLogin = $currentChannel.toLowerCase()
	$: messages = messageStore currentChannelLogin
	$: {
		$messages;
		$currentChannel
		scrollDown()
	}
	onMount => scrollDown true

	function reload(event: KeyboardEvent)
		return unless event.key === "F5" || (event.ctrlKey && event.key === "r")
		event.preventDefault()

		console.log "Reloading channel", $currentChannel
		channelId := channelIds.get $currentChannel
		channelIds.delete $currentChannel
		if channelId
			setChannelId $currentChannel, channelId

	$: displayMessages = $messages
		.slice(-150)
		.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
	$: unless getSetting twitchNativePlugin, "show-left-joined"
		displayMessages = displayMessages.filter(
			(message) => message.type !== "part" && message.type !== "join"
		)
</script>

<svelte:window on:keydown={reload} />

<ul bind:this={messageElement}>
	{#each displayMessages as msg}
		<li>
			{#if msg.type === "privmsg"}
				<PrivMessage message={msg} />
			{:else if msg.type === "join"}
				<JoinMessage message={msg} />
			{:else if msg.type === "part"}
				<PartMessage message={msg} />
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding: 0;
		padding-left: 0.5ch;
		margin: 0;
		flex: 1;
		overflow-y: auto; /* scrollable if too large */
	}
	li {
		word-wrap: break-word;
	}
</style>
