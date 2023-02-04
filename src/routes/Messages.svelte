<script lang="ts">
	import { channelIds, currentChannel, messageStore, setChannelId } from "$lib/api"
	import Message from "$lib/chat/Message.svelte"
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
</script>

<svelte:window on:keydown={reload} />

<ul bind:this={messageElement}>
	{#each $messages as msg (msg.message_id)}
		<li><Message message={msg} /></li>
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
