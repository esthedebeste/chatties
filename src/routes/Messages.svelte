<script lang="ts">
	import { channelIds, currentChannel, messageStore, setChannelId } from "$lib/api"
	import JoinMessage from "$lib/chat/JoinMessage.svelte"
	import PartMessage from "$lib/chat/PartMessage.svelte"
	import PrivMessage from "$lib/chat/PrivMessage.svelte"
	import { onMount } from "svelte"
	let messageElement: HTMLUListElement

	function scrollDown(force = false) {
		if (!messageElement) return
		const atBottom =
			messageElement.scrollTop + messageElement.clientHeight >= messageElement.scrollHeight - 30 // 30px buffer
		if (force || atBottom) setTimeout(() => messageElement.scroll(0, messageElement.scrollHeight)) // scroll to bottom again to account for the new message
	}

	$: currentChannelLogin = $currentChannel.toLowerCase()
	$: messages = messageStore(currentChannelLogin)
	$: {
		$messages
		$currentChannel
		scrollDown()
	}
	onMount(() => scrollDown(true))

	function reload(event: KeyboardEvent) {
		if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
			event.preventDefault()

			console.log("Reloading channel", $currentChannel)
			const channelId = channelIds.get($currentChannel)
			channelIds.delete($currentChannel)
			if (channelId) setChannelId($currentChannel, channelId)
		}
	}
	$: displayMessages = $messages
		.slice(-150)
		.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
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
