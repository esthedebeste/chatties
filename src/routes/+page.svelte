<script lang="ts">
	import { messageStore, onPrivMsg } from "$lib/api";
	import Message from "$lib/chat/Message.svelte";
	import { onMount, setContext } from "svelte";
	import Channels from "./Channels.svelte";
	import EmoteTooltip from "$lib/EmoteTooltip.svelte";
	import JoinChannel from "./JoinChannel.svelte";
	import SendMessage from "./SendMessage.svelte";
	import { clone } from "$lib/utils";
	import { writable } from "svelte/store";
	import Login from "./Login.svelte";
	let messageElem: HTMLUListElement;

	function scrollDown(force = false) {
		if (!messageElem) return;
		const atBottom =
			messageElem.scrollTop + messageElem.clientHeight >=
			messageElem.scrollHeight - 30; // 30px buffer
		if (atBottom || force)
			setTimeout(() => messageElem.scroll(0, messageElem.scrollHeight)); // scroll to bottom again to account for the new message
	}

	let currentChannel = writable(localStorage.getItem("currentChannel") || "");
	$: currentChannelLogin = $currentChannel.toLowerCase();
	$: messages = messageStore(currentChannelLogin);
	$: {
		$messages;
		scrollDown();
	}

	$: {
		scrollDown();
		localStorage.setItem("currentChannel", $currentChannel);
	}
	onMount(() => scrollDown(true));
	setContext("currentChannel", currentChannel);
</script>

<main>
	<nav>
		<div>
			<h1>Chatties :3</h1>
			<i>
				#1 goat-only twitch chat client, experts say <small>
					({import.meta.env.VITE_APP_VERSION})
				</small>
			</i>
		</div>
		<Login />
	</nav>
	<JoinChannel />

	<Channels />

	<ul bind:this={messageElem}>
		{#each $messages as msg (msg.message_id)}
			<li><Message msg={clone(msg)} /></li>
		{/each}
	</ul>
	<SendMessage />

	<EmoteTooltip />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	nav {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 0.5ch;
		border-bottom: 1px solid #777;
	}
	ul {
		list-style: none;
		padding: 0;
		padding-left: 0.5ch;
		margin: 0;
		flex: 1;
		overflow-y: auto; /* scrollable if too large */
		border-top: 1px solid #777;
	}
	h1 {
		display: inline;
	}
	i {
		display: block;
	}
</style>
