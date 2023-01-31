<script lang="ts">
	import { messageStore } from "$lib/api"
	import Message from "$lib/chat/Message.svelte"
	import { getContext, onMount } from "svelte"
	import { clone } from "$lib/utils"
	import type { Readable } from "svelte/store"
	let messageElement: HTMLUListElement

	function scrollDown(force = false) {
		if (!messageElement) return
		const atBottom =
			messageElement.scrollTop + messageElement.clientHeight >= messageElement.scrollHeight - 30 // 30px buffer
		if (force || atBottom) setTimeout(() => messageElement.scroll(0, messageElement.scrollHeight)) // scroll to bottom again to account for the new message
	}

	const currentChannel = getContext<Readable<string>>("currentChannel")
	$: currentChannelLogin = $currentChannel.toLowerCase()
	$: messages = messageStore(currentChannelLogin)
	$: {
		$messages
		$currentChannel
		scrollDown()
	}
	onMount(() => scrollDown(true))
</script>

<ul bind:this={messageElement}>
	{#each $messages as msg (msg.message_id)}
		<li><Message message={clone(msg)} /></li>
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
		border-top: 1px solid #777;
	}
	li {
		word-wrap: break-word;
	}
</style>
